import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';

const OrderCard = ({ order }) => {
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return '#10b981';
            case 'PENDING': return '#f59e0b';
            case 'FAILED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SUCCESS': return 'Thành công';
            case 'PENDING': return 'Chờ xử lý';
            case 'FAILED': return 'Thất bại';
            default: return status;
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'PAYOS': return 'PayOS';
            case 'COD': return 'Thanh toán khi nhận hàng';
            default: return method;
        }
    };

    const fetchOrderDetails = async () => {
        if (showDetails && orderDetails) {
            setShowDetails(false);
            return;
        }

        setLoading(true);
        try {
            const response = await paymentService.getOrderDetails(order.OrderID);
            if (response.success) {
                setOrderDetails(response.data);
                setShowDetails(true);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '6px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            border: '1px solid #e5e7eb'
        }}>
            {/* Order Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h3 style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#1f2937',
                            margin: 0
                        }}>
                            Đơn hàng #{order.OrderID}
                        </h3>
                        <span style={{
                            padding: '2px 8px',
                            background: `${getStatusColor(order.PaymentStatus)}15`,
                            color: getStatusColor(order.PaymentStatus),
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600'
                        }}>
                            {getStatusText(order.PaymentStatus)}
                        </span>
                    </div>
                    <p style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af',
                        margin: 0
                    }}>
                        {new Date(order.OrderDate).toLocaleString('vi-VN')}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        marginBottom: '2px'
                    }}>
                        {order.TotalAmount?.toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {getPaymentMethodText(order.PaymentMethod)}
                    </div>
                </div>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af',
                    marginBottom: '4px'
                }}>
                    Địa chỉ giao hàng:
                </div>
                <div style={{ fontSize: '13px', color: '#374151' }}>
                    {order.ShippingAddress}
                </div>
            </div>

            {/* Order Details (Expandable) */}
            {showDetails && orderDetails && (
                <div style={{
                    background: '#f9fafb',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '12px'
                }}>
                    <h4 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: '#374151',
                        marginBottom: '10px'
                    }}>
                        Chi tiết sản phẩm
                    </h4>
                    {orderDetails.items?.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: index < orderDetails.items.length - 1 ? '1px solid #e5e7eb' : 'none'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>
                                    {item.ProductName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                    Số lượng: {item.Quantity}
                                </div>
                            </div>
                            <div style={{ 
                                fontSize: '13px', 
                                fontWeight: '600', 
                                color: '#1f2937',
                                textAlign: 'right'
                            }}>
                                {(item.UnitPrice * item.Quantity).toLocaleString('vi-VN')} ₫
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={fetchOrderDetails}
                    disabled={loading}
                    style={{
                        padding: '7px 16px',
                        background: 'white',
                        color: '#3b82f6',
                        border: '1px solid #3b82f6',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Đang tải...' : showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
                {order.PaymentStatus === 'PENDING' && order.PaymentMethod === 'PAYOS' && (
                    <button
                        onClick={() => navigate(`/payment/qr`, { 
                            state: { orderId: order.OrderID } 
                        })}
                        style={{
                            padding: '7px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                        }}
                    >
                        Thanh toán lại
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
