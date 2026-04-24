const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Tạo link thanh toán
router.post('/create', paymentController.createPaymentLink);

// Webhook từ PayOS
router.post('/webhook', paymentController.handleWebhook);

// Kiểm tra trạng thái thanh toán
router.get('/status/:orderId', paymentController.checkPaymentStatus);

// Hủy thanh toán
router.post('/cancel/:orderId', paymentController.cancelPayment);

// Lấy danh sách đơn hàng của user
router.get('/orders/user/:userId', paymentController.getUserOrders);

// Lấy chi tiết đơn hàng
router.get('/orders/:orderId', paymentController.getOrderDetails);

// ==========================================
// CÁC ROUTES MỚI CHO QUẢN LÝ HÓA ĐƠN STAFF
// ==========================================

// Lấy danh sách hóa đơn khám bệnh
router.get('/appointment-invoices', paymentController.getAppointmentInvoices);

// Nhân viên xác nhận thu tiền mặt tại quầy
router.put('/appointment-invoices/:invoiceId/cash', paymentController.confirmCashPayment);

// Tạo link thanh toán PayOS cho hóa đơn khám bệnh
router.post('/appointment-invoices/payos', paymentController.createAppointmentPaymentLink);

module.exports = router;