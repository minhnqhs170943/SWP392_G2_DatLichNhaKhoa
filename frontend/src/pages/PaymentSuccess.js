import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import paymentService from '../services/paymentService';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPayment = async () => {
            try {
                // Kiểm tra xem có data từ COD không
                if (location.state?.orderData) {
                    setOrderDetails({
                        orderId: location.state.orderData.orderId,
                        totalAmount: location.state.orderData.totalAmount,
                        paymentStatus: 'COD'
                    });
                    setLoading(false);
                    return;
                }

                // Nếu không, check từ PayOS
                const orderId = searchParams.get('orderCode');
                
                if (!orderId) {
                    navigate('/');
                    return;
                }

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
    }, [searchParams, navigate, location]);

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5'
            }}>
                <h2 style={{ color: '#666' }}>Đang kiểm tra thanh toán...</h2>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '48px 40px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                {/* Success Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#4CAF50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    animation: 'scaleIn 0.3s ease-out'
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>

                {/* Title */}
                <h1 style={{
                    color: '#333',
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '12px'
                }}>
                    Thanh toán thành công!
                </h1>

                <p style={{
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
                </p>

                {/* Order Details */}
                {orderDetails && (
                    <div style={{
                        background: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '32px',
                        textAlign: 'left'
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ color: '#666', fontSize: '13px' }}>Mã đơn hàng</span>
                            <div style={{ color: '#333', fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>
                                #{orderDetails.orderId}
                            </div>
                        </div>
                        <div style={{ 
                            borderTop: '1px solid #e0e0e0',
                            paddingTop: '12px'
                        }}>
                            <span style={{ color: '#666', fontSize: '13px' }}>Tổng tiền</span>
                            <div style={{ color: '#4CAF50', fontSize: '20px', fontWeight: '600', marginTop: '4px' }}>
                                {orderDetails.totalAmount?.toLocaleString('vi-VN')} VNĐ
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/orders')}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'white',
                            color: '#333',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                        Xem đơn hàng
                    </button>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#45a049'}
                        onMouseOut={(e) => e.target.style.background = '#4CAF50'}
                    >
                        Về trang chủ
                    </button>
                </div>

                <style>{`
                    @keyframes scaleIn {
                        from {
                            transform: scale(0);
                            opacity: 0;
                        }
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default PaymentSuccess;
