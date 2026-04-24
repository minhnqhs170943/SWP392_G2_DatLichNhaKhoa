import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import paymentService from '../services/paymentService';

const PaymentQRPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(600);

    // Xác định xem đây có phải là thanh toán của Staff không (Dựa vào tiền tố 'APT-')
    const isStaffInvoice = location.state?.paymentData?.orderId?.toString().startsWith('APT-');

    // EFFECT 1: Lấy dữ liệu và thiết lập timer mô phỏng thành công
    useEffect(() => {
        const currentData = location.state?.paymentData;
        
        if (currentData) {
            setPaymentData(currentData);
            
            // Chuyển logic của startCheckingPayment vào trực tiếp đây
            const successTimer = setTimeout(() => {
                navigate(`/payment/success?orderCode=${currentData.orderId}`);
            }, 20000);

            return () => clearTimeout(successTimer); // Cleanup khi unmount
        } else {
            navigate('/checkout');
        }
    }, [location.state, navigate]); // Đã điền đầy đủ dependency để xóa Warning Eslint
    
    // EFFECT 2: Đếm ngược thời gian
    useEffect(() => {
        if (timeLeft <= 0) {
            alert('Hết thời gian thanh toán!');
            if (isStaffInvoice) {
                navigate('/staff/invoices');
            } else {
                navigate('/payment/cancel');
            }
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate, isStaffInvoice]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Hàm xử lý nút Hủy
    const handleCancel = async () => {
        if (isStaffInvoice) {
            navigate('/staff/invoices');
        } else {
            try {
                await paymentService.cancelPayment(paymentData.orderId);
                navigate('/payment/cancel');
            } catch (error) {
                console.error('Error canceling payment:', error);
                navigate('/payment/cancel');
            }
        }
    };

    if (!paymentData) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <h2 style={{ color: '#666' }}>Đang tải...</h2>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{
                background: 'white', borderRadius: '8px', padding: '40px', maxWidth: '450px',
                width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#333', marginBottom: '8px', fontSize: '20px', fontWeight: '600' }}>
                        Thanh toán {isStaffInvoice ? 'hóa đơn khám' : 'đơn hàng'}
                    </h2>
                    <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                        Mã giao dịch: <strong>#{paymentData.orderId}</strong>
                    </p>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#fafafa', borderRadius: '8px', marginBottom: '24px' }}>
                    <QRCodeSVG value={paymentData.qrCode} size={220} level="H" includeMargin={false} />
                </div>

                <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '-12px', marginBottom: '24px' }}>
                    Quét mã QR để thanh toán
                </p>

                {/* Thông tin thanh toán */}
                <div style={{ borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', padding: '16px 0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Số tiền:</span>
                        <strong style={{ color: '#333', fontSize: '16px' }}>{paymentData.amount?.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>Thời gian còn lại:</span>
                        <strong style={{ color: timeLeft < 60 ? '#d32f2f' : '#333', fontSize: '14px' }}>{formatTime(timeLeft)}</strong>
                    </div>
                </div>

                {/* Hướng dẫn */}
                <div style={{ background: '#fafafa', padding: '16px', borderRadius: '6px', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        <strong style={{ color: '#333' }}>Hướng dẫn:</strong><br/>
                        1. Mở app ngân hàng<br/>
                        2. Quét mã QR<br/>
                        3. Xác nhận thanh toán<br/>
                        4. Hệ thống tự động cập nhật
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => window.open(paymentData.checkoutUrl, '_blank')}
                        style={{
                            flex: 1, padding: '12px', background: '#333', color: 'white', border: 'none',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#555'}
                        onMouseOut={(e) => e.target.style.background = '#333'}
                    >
                        Mở trang PayOS
                    </button>
                    
                    <button
                        onClick={handleCancel}
                        style={{
                            flex: 1, padding: '12px', background: 'white', color: '#d32f2f', border: '1px solid #d32f2f',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.target.style.background = '#d32f2f'; e.target.style.color = 'white'; }}
                        onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#d32f2f'; }}
                    >
                        {isStaffInvoice ? 'Quay lại' : 'Hủy thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentQRPage;