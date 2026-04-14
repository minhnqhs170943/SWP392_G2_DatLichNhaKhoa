import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
            <div style={{ 
                backgroundColor: '#f44336', 
                color: 'white', 
                padding: '20px', 
                borderRadius: '10px',
                marginBottom: '20px'
            }}>
                <h1>✗ Thanh toán đã bị hủy</h1>
            </div>

            <p style={{ fontSize: '18px', marginBottom: '30px' }}>
                Đơn hàng của bạn chưa được thanh toán. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
            </p>

            <div>
                <button 
                    onClick={() => navigate('/cart')}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Quay lại giỏ hàng
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

export default PaymentCancel;
