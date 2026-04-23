const payos = require('../config/payos');
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');
const OrderDetail = require('../models/orderDetail.model');
const Notification = require('../models/notification.model');

class PaymentController {
    // Tạo link thanh toán PayOS
    async createPaymentLink(req, res) {
        try {
            const { userId, items, shippingAddress, paymentMethod, returnUrl, cancelUrl } = req.body;

            // Validate input
            if (!userId || !items || items.length === 0 || !shippingAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin đơn hàng'
                });
            }

            // Tính tổng tiền
            const totalAmount = items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Xác định payment method (mặc định là PAYOS nếu không có)
            const finalPaymentMethod = paymentMethod || 'PAYOS';

            // Tạo order trong database
            const order = await Order.create({
                userId,
                totalAmount,
                shippingAddress,
                status: 'Pending'
            });

            // Tạo order details
            const orderDetails = items.map(item => ({
                orderId: order.OrderID,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price
            }));
            await OrderDetail.createBulk(orderDetails);

            // Nếu là COD, không cần tạo payment link
            if (finalPaymentMethod === 'COD') {
                // Tạo invoice
                const invoice = await Invoice.create({
                    orderId: order.OrderID,
                    totalAmount,
                    status: 'SUCCESS'
                });

                // Tạo payment
                await Payment.create({
                    invoiceId: invoice.InvoiceID,
                    transactionId: `COD-${order.OrderID}`,
                    amount: totalAmount,
                    paymentMethod: 'COD',
                    status: 'SUCCESS'
                });

                // Cập nhật order status
                await Order.updateStatus(order.OrderID, 'SUCCESS');

                // Tạo thông báo cho user
                await Notification.createNotification({
                    userId,
                    type: 'ORDER',
                    title: `Đơn hàng #${order.OrderID} đã được đặt thành công`,
                    message: `Đơn hàng của bạn đã được xác nhận. Vui lòng chuẩn bị ${totalAmount.toLocaleString('vi-VN')}đ để thanh toán khi nhận hàng.`
                });

                return res.status(200).json({
                    success: true,
                    message: 'Tạo đơn hàng COD thành công',
                    data: {
                        orderId: order.OrderID
                    }
                });
            }

            // Tạo payment link với PayOS
            const orderCode = Math.floor(100000 + Math.random() * 900000);
            const paymentData = {
                orderCode: orderCode,
                amount: totalAmount,
                description: `Thanh toan don hang #${order.OrderID}`,
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`,
                returnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/success?orderCode=${order.OrderID}`
            };

            const paymentLinkResponse = await payos.paymentRequests.create(paymentData);

            // Tạo invoice
            const invoice = await Invoice.create({
                orderId: order.OrderID,
                totalAmount,
                paymentLinkId: orderCode.toString(),
                status: 'SUCCESS' // Giả lập đã thanh toán (vì không có webhook)
            });

            // Tạo payment
            await Payment.create({
                invoiceId: invoice.InvoiceID,
                transactionId: orderCode.toString(),
                amount: totalAmount,
                paymentMethod: 'PAYOS',
                status: 'SUCCESS' // Giả lập đã thanh toán
            });

            // Cập nhật order status
            await Order.updateStatus(order.OrderID, 'SUCCESS');

            // Tạo thông báo cho user
            await Notification.createNotification({
                userId,
                type: 'PAYMENT',
                title: `Thanh toán thành công đơn hàng #${order.OrderID}`,
                message: `Bạn đã thanh toán thành công ${totalAmount.toLocaleString('vi-VN')}đ. Đơn hàng đang được xử lý và sẽ sớm được giao đến bạn.`
            });

            res.status(200).json({
                success: true,
                message: 'Tạo link thanh toán thành công',
                data: {
                    orderId: order.OrderID,
                    checkoutUrl: paymentLinkResponse.checkoutUrl,
                    qrCode: paymentLinkResponse.qrCode
                }
            });

        } catch (error) {
            console.error('Error creating payment link:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi tạo link thanh toán',
                error: error.message
            });
        }
    }

    // Webhook nhận thông báo từ PayOS
    async handleWebhook(req, res) {
        try {
            const webhookData = req.body;
            const verifiedData = payos.webhooks.verify(webhookData);

            const { orderCode, code } = verifiedData.data;

            // Tìm payment theo orderCode
            const payment = await Payment.findByTransactionId(orderCode.toString());
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Cập nhật trạng thái thanh toán
            let paymentStatus = 'FAILED';
            if (code === '00') {
                paymentStatus = 'SUCCESS';
            } else if (code === '01') {
                paymentStatus = 'PENDING';
            }

            await Payment.updateStatus(payment.PaymentID, paymentStatus);
            await Order.updatePaymentStatus(payment.OrderID, paymentStatus);

            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully'
            });

        } catch (error) {
            console.error('Error handling webhook:', error);
            res.status(400).json({
                success: false,
                message: 'Invalid webhook',
                error: error.message
            });
        }
    }

    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus(req, res) {
        try {
            const { orderId } = req.params; // Nhận "APT-9" hoặc mã số
            const { statusFromFE } = req.query; // Nhận tín hiệu SUCCESS từ Frontend
            let paymentInfo = null;
            let actualPayOSCode = orderId;
            let dbAmount = 0;

            const pool = await require('../config/db').sql.connect();

            // 1. NẾU LÀ MÃ STAFF (APT-), TÌM MÃ THANH TOÁN THỰC TRONG DATABASE TRƯỚC
            if (orderId.toString().startsWith('APT-')) {
                const appointmentId = orderId.replace('APT-', '');
                const result = await pool.request()
                    .input('AppointmentID', require('../config/db').sql.Int, appointmentId)
                    .query("SELECT PaymentLinkId, TotalAmount FROM Invoices WHERE AppointmentID = @AppointmentID");
                
                if (result.recordset.length > 0) {
                    actualPayOSCode = result.recordset[0].PaymentLinkId || orderId;
                    dbAmount = result.recordset[0].TotalAmount || 0;
                }
            }

            // 2. GỬI YÊU CẦU KIỂM TRA TỚI PAYOS VỚI MÃ SỐ THỰC
            try {
                paymentInfo = await payos.getPaymentInformation(actualPayOSCode);
            } catch (payosErr) {
                console.warn(`>>> PayOS không tìm thấy mã: ${actualPayOSCode}`);
            }

            // 3. LOGIC CẬP NHẬT DATABASE (Xác nhận từ PayOS HOẶC Tín hiệu SUCCESS từ trang Success)
            const isPaid = (paymentInfo && paymentInfo.status === 'PAID') || statusFromFE === 'SUCCESS';

            if (isPaid) {
                if (orderId.toString().startsWith('APT-')) {
                    const appointmentId = orderId.replace('APT-', '');
                    await pool.request()
                        .input('AppointmentID', require('../config/db').sql.Int, appointmentId)
                        .query("UPDATE Invoices SET Status = 'SUCCESS' WHERE AppointmentID = @AppointmentID");
                    console.log(`>>> Cập nhật thành công DB cho lịch hẹn: ${appointmentId}`);
                } else {
                    await Order.updatePaymentStatus(orderId, 'SUCCESS');
                }
            }

            // 4. TRẢ VỀ DỮ LIỆU CHÍNH XÁC
            res.status(200).json({
                success: true,
                data: {
                    orderId: orderId,
                    totalAmount: (paymentInfo && paymentInfo.amount) ? paymentInfo.amount : dbAmount,
                    status: isPaid ? 'PAID' : 'PENDING',
                    paymentStatus: isPaid ? 'SUCCESS' : 'PENDING'
                }
            });

        } catch (error) {
            console.error('LỖI KIỂM TRA THANH TOÁN:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi máy chủ khi kiểm tra thanh toán',
                error: error.message
            });
        }
    }

    // Hủy thanh toán
    async cancelPayment(req, res) {
        try {
            const { orderId } = req.params;

            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            const invoice = await Invoice.findByOrderId(orderId);
            
            if (invoice) {
                await Invoice.updateStatus(invoice.InvoiceID, 'CANCELLED');
                
                const payment = await Payment.findByInvoiceId(invoice.InvoiceID);
                if (payment) {
                    await Payment.updateStatus(payment.PaymentID, 'CANCELLED');
                }
            }
            
            await Order.updateStatus(orderId, 'CANCELLED');

            res.status(200).json({
                success: true,
                message: 'Hủy thanh toán thành công'
            });

        } catch (error) {
            console.error('Error canceling payment:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi hủy thanh toán',
                error: error.message
            });
        }
    }

    // Lấy danh sách đơn hàng của user
    async getUserOrders(req, res) {
        try {
            const { userId } = req.params;

            const orders = await Order.getOrdersByUser(userId);

            res.status(200).json({
                success: true,
                data: orders
            });

        } catch (error) {
            console.error('Error getting user orders:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy danh sách đơn hàng',
                error: error.message
            });
        }
    }

    // Lấy chi tiết đơn hàng
    async getOrderDetails(req, res) {
        try {
            const { orderId } = req.params;

            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            const orderDetails = await OrderDetail.getByOrderId(orderId);
            const invoice = await Invoice.findByOrderId(orderId);
            const payment = invoice ? await Payment.findByInvoiceId(invoice.InvoiceID) : null;

            res.status(200).json({
                success: true,
                data: {
                    order,
                    items: orderDetails,
                    invoice,
                    payment
                }
            });

        } catch (error) {
            console.error('Error getting order details:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy chi tiết đơn hàng',
                error: error.message
            });
        }
    }

    // ==========================================
    // CÁC HÀM MỚI CHO QUẢN LÝ HÓA ĐƠN STAFF
    // ==========================================

    // 1. Lấy danh sách hóa đơn khám bệnh cho Staff
    async getAppointmentInvoices(req, res) {
        try {
            const invoices = await Invoice.getAppointmentInvoices();
            res.status(200).json({
                success: true,
                data: invoices
            });
        } catch (error) {
            console.error('Error getting appointment invoices:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi lấy danh sách hóa đơn',
                error: error.message
            });
        }
    }

    // 2. Nhân viên xác nhận thu tiền mặt tại quầy
    async confirmCashPayment(req, res) {
        try {
            const { invoiceId } = req.params;

            const invoice = await Invoice.findById(invoiceId);
            if (!invoice) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
            }

            // Cập nhật trạng thái Invoice thành SUCCESS
            await Invoice.updateStatus(invoiceId, 'Paid');

            // Tạo bản ghi Payment ghi nhận thanh toán tiền mặt
            await Payment.create({
                invoiceId: invoiceId,
                transactionId: `CASH-${invoiceId}-${Date.now()}`,
                amount: invoice.TotalAmount,
                paymentMethod: 'CASH',
                status: 'SUCCESS'
            });

            res.status(200).json({
                success: true,
                message: 'Đã xác nhận thu tiền mặt thành công'
            });
        } catch (error) {
            console.error('Error confirming cash payment:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi xác nhận thanh toán',
                error: error.message
            });
        }
    }

    // 3. Tạo QR PayOS cho hóa đơn khám bệnh
    async createAppointmentPaymentLink(req, res) {
        try {
            const { invoiceId, returnUrl, cancelUrl } = req.body;

            const invoice = await Invoice.findById(invoiceId);
            if (!invoice) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
            }

            // CHỈNH SỬA: Ép kiểu thành số nguyên để PayOS không báo lỗi
            const amountInt = Math.round(Number(invoice.TotalAmount));
            const orderCode = Math.floor(100000 + Math.random() * 900000);
            
            const defaultUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

            const paymentData = {
                orderCode: orderCode,
                amount: amountInt, // Sử dụng biến số nguyên
                description: `Thanh toan HD kham ${invoiceId}`.substring(0, 25), // Cắt ngắn chuỗi nếu quá dài
                items: [{
                    name: `Phi kham (HD: ${invoiceId})`, // Rút ngắn, bỏ dấu tiếng Việt để an toàn
                    quantity: 1,
                    price: amountInt // Sử dụng biến số nguyên
                }],
                cancelUrl: cancelUrl || `${defaultUrl}/payment/cancel`,
                returnUrl: returnUrl || `${defaultUrl}/payment/success`
            };

            const paymentLinkResponse = await payos.paymentRequests.create(paymentData);

            // Cập nhật mã PaymentLinkId vào Invoice để sau này check Webhook
            const pool = await require('../config/db').sql.connect();
            await pool.request()
                .input('InvoiceID', require('../config/db').sql.Int, invoiceId)
                .input('PaymentLinkId', require('../config/db').sql.VarChar(100), orderCode.toString())
                .query('UPDATE Invoices SET PaymentLinkId = @PaymentLinkId WHERE InvoiceID = @InvoiceID');

            res.status(200).json({
                success: true,
                message: 'Tạo link thanh toán PayOS thành công',
                data: {
                    checkoutUrl: paymentLinkResponse.checkoutUrl,
                    qrCode: paymentLinkResponse.qrCode
                }
            });

        } catch (error) {
            console.error('Error creating appointment payos link:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi tạo QR thanh toán',
                error: error.message
            });
        }
    }
}

module.exports = new PaymentController();