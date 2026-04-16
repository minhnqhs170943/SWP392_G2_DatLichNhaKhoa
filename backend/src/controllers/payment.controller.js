const payos = require('../config/payos');
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const Invoice = require('../models/invoice.model');
const OrderDetail = require('../models/orderDetail.model');

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
