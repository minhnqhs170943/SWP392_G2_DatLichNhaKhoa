import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../services/paymentService';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPayment = async () => {
            try {
                const orderId = searchParams.get('orderCode');
                
                if (!orderId) {
                    navigate('/');
                    return;
                }

                // Kiểm tra trạng thái thanh toán
                const response = await paymentService.checkPaymentStatus(orderId);
                
                if (response.success) {
                    setOrderDetails(response.data);
                }
            } catch (error) {
                console.error('Error checking payment:', error);
            } finally {
                setLoading(false);
            }
        };

        checkPayment();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Đang kiểm tra thanh toán...</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
            <div style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '20px'
            }}>
                <h1>✓ Thanh toán thành công!</h1>
            </div>

            {orderDetails && (
                <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '20px', 
                    borderRadius: '10px',
                    textAlign: 'left'
                }}>
                    <h3>Thông tin đơn hàng</h3>
                    <p><strong>Mã đơn hàng:</strong> #{orderDetails.orderId}</p>
                    <p><strong>Tổng tiền:</strong> {orderDetails.totalAmount?.toLocaleString('vi-VN')} VNĐ</p>
                    <p><strong>Trạng thái:</strong> {orderDetails.paymentStatus}</p>
                </div>
            )}

            <div style={{ marginTop: '30px' }}>
                <button 
                    onClick={() => navigate('/orders')}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Xem đơn hàng
                </button>
                <button 
                    onClick={() => navigate('/')}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
