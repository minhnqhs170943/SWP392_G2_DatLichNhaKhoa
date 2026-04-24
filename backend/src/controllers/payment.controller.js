const payos = require('../config/payos');
const { sql } = require('../config/db');
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');
const OrderDetail = require('../models/orderDetail.model');
const Notification = require('../models/notification.model');

class PaymentController {
    // Tạo link thanh toán PayOS
    async createPaymentLink(req, res) {
        try {
            const { userId, items = [], appointmentIds = [], shippingAddress, paymentMethod, returnUrl, cancelUrl } = req.body;
            const parsedAppointmentIds = [...new Set((appointmentIds || [])
                .map((id) => parseInt(id, 10))
                .filter((id) => Number.isInteger(id) && id > 0))];

            // Validate input
            if (!userId || (!items.length && !parsedAppointmentIds.length) || !shippingAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin thanh toán'
                });
            }

            // Tổng tiền sản phẩm trong cart
            const cartAmount = items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Tính tổng tiền lịch hẹn đã confirmed + chuẩn bị invoice để mark Paid
            const appointmentCharges = [];
            const pool = await sql.connect();

            for (const appointmentId of parsedAppointmentIds) {
                const checkResult = await pool.request()
                    .input('AppointmentID', sql.Int, appointmentId)
                    .input('UserID', sql.Int, userId)
                    .query(`
                        SELECT
                            a.AppointmentID,
                            a.Status,
                            inv.InvoiceID,
                            inv.Status AS InvoiceStatus,
                            inv.TotalAmount AS InvoiceAmount,
                            ISNULL((
                                SELECT SUM(aps.PriceAtBooking)
                                FROM AppointmentServices aps
                                WHERE aps.AppointmentID = a.AppointmentID
                            ), 0) AS CalculatedAmount
                        FROM Appointments a
                        LEFT JOIN Invoices inv ON inv.AppointmentID = a.AppointmentID
                        WHERE a.AppointmentID = @AppointmentID
                          AND a.PatientID = @UserID
                    `);

                if (!checkResult.recordset.length) {
                    return res.status(400).json({
                        success: false,
                        message: `Lịch hẹn #${appointmentId} không hợp lệ hoặc không thuộc về bạn`
                    });
                }

                const appt = checkResult.recordset[0];
                const appointmentStatus = String(appt.Status || '').toLowerCase();
                if (appointmentStatus === 'cancelled') {
                    return res.status(400).json({
                        success: false,
                        message: `Không thể thanh toán lịch hẹn đã hủy (#${appointmentId})`
                    });
                }

                const invoiceStatus = String(appt.InvoiceStatus || '').toLowerCase();
                if (invoiceStatus === 'paid') {
                    continue;
                }

                const amount = Number(appt.InvoiceAmount ?? appt.CalculatedAmount ?? 0);
                let invoiceId = appt.InvoiceID;

                if (!invoiceId) {
                    const createdInvoice = await Invoice.create({
                        appointmentId: appt.AppointmentID,
                        totalAmount: amount,
                        status: 'Unpaid'
                    });
                    invoiceId = createdInvoice.InvoiceID;
                }

                appointmentCharges.push({
                    appointmentId: appt.AppointmentID,
                    invoiceId,
                    amount
                });
            }

            const appointmentAmount = appointmentCharges.reduce((sum, x) => sum + x.amount, 0);
            const totalAmount = cartAmount + appointmentAmount;

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
            if (items.length > 0) {
                const orderDetails = items.map(item => ({
                    orderId: order.OrderID,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price
                }));
                await OrderDetail.createBulk(orderDetails);
            }

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

                // Mark Paid cho invoice lịch hẹn đi cùng checkout
                for (const appt of appointmentCharges) {
                    await Invoice.updateStatus(appt.invoiceId, 'Paid');
                }

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
                items: [
                    ...items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    ...appointmentCharges.map(appt => ({
                        name: `Lich hen #${appt.appointmentId}`,
                        quantity: 1,
                        price: appt.amount
                    }))
                ],
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

            // Mark Paid cho invoice lịch hẹn đi cùng checkout
            for (const appt of appointmentCharges) {
                await Invoice.updateStatus(appt.invoiceId, 'Paid');
            }

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
            const { orderId } = req.params;

            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            const invoice = await Invoice.findByOrderId(orderId);
            const payment = invoice ? await Payment.findByInvoiceId(invoice.InvoiceID) : null;

            res.status(200).json({
                success: true,
                data: {
                    orderId: order.OrderID,
                    paymentStatus: invoice ? invoice.Status : 'Unpaid',
                    totalAmount: order.TotalAmount,
                    payment: payment
                }
            });

        } catch (error) {
            console.error('Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra trạng thái thanh toán',
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
}

module.exports = new PaymentController();
