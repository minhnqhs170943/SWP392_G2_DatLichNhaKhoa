const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class PaymentService {
    // Tạo link thanh toán
    async createPayment(paymentData) {
        try {
            const response = await fetch(`${API_URL}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lỗi tạo thanh toán');
            }

            return data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus(orderId) {
        try {
            const response = await fetch(`${API_URL}/payment/status/${orderId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lỗi kiểm tra trạng thái');
            }

            return data;
        } catch (error) {
            console.error('Error checking payment status:', error);
            throw error;
        }
    }

    // Hủy thanh toán
    async cancelPayment(orderId) {
        try {
            const response = await fetch(`${API_URL}/payment/cancel/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lỗi hủy thanh toán');
            }

            return data;
        } catch (error) {
            console.error('Error canceling payment:', error);
            throw error;
        }
    }

    // Lấy danh sách đơn hàng
    async getUserOrders(userId) {
        try {
            const response = await fetch(`${API_URL}/payment/orders/user/${userId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lỗi lấy danh sách đơn hàng');
            }

            return data;
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }

    // Lấy chi tiết đơn hàng
    async getOrderDetails(orderId) {
        try {
            const response = await fetch(`${API_URL}/payment/orders/${orderId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Lỗi lấy chi tiết đơn hàng');
            }

            return data;
        } catch (error) {
            console.error('Error getting order details:', error);
            throw error;
        }
    }
}

const paymentService = new PaymentService();
export default paymentService;
