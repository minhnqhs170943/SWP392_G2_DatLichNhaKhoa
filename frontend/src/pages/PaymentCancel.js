import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
    const navigate = useNavigate();

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
                {/* Cancel Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#f44336',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    animation: 'scaleIn 0.3s ease-out'
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>

                {/* Title */}
                <h1 style={{
                    color: '#333',
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '12px'
                }}>
                    Thanh toán đã bị hủy
                </h1>

                <p style={{
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    Đơn hàng của bạn chưa được thanh toán. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
                </p>

                {/* Info Box */}
                <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    padding: '16px',
                    borderRadius: '6px',
                    marginBottom: '32px',
                    textAlign: 'left'
                }}>
                    <div style={{ 
                        color: '#856404', 
                        fontSize: '13px',
                        lineHeight: '1.6'
                    }}>
                        <strong>💡 Lưu ý:</strong><br/>
                        • Đơn hàng vẫn được lưu trong giỏ hàng<br/>
                        • Bạn có thể thanh toán lại bất cứ lúc nào<br/>
                        • Liên hệ hỗ trợ nếu gặp vấn đề
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/cart')}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#F57C00'}
                        onMouseOut={(e) => e.target.style.background = '#FF9800'}
                    >
                        Quay lại giỏ hàng
                    </button>
                    <button
                        onClick={() => navigate('/home')}
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

export default PaymentCancel;
