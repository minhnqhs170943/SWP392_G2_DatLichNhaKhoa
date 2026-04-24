import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderCard from '../components/Orders/OrderCard';
import paymentService from '../services/paymentService';
import { getMyAppointments, payAppointment } from '../services/appointmentApi';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [appointmentsNeedPayment, setAppointmentsNeedPayment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingAppointmentId, setPayingAppointmentId] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, SUCCESS, PENDING, FAILED

    const fetchOrders = useCallback(async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);
            const [orderResponse, appointmentResponse] = await Promise.all([
                paymentService.getUserOrders(user.UserID),
                getMyAppointments(user.UserID)
            ]);

            if (orderResponse.success) {
                setOrders(orderResponse.data);
            }

            const confirmedAndUnpaid = (appointmentResponse || []).filter((appt) => {
                const isConfirmed = appt.Status === 'Confirmed';
                const invoiceStatus = (appt.InvoiceStatus || '').toLowerCase();
                const paymentStatus = (appt.PaymentStatus || '').toLowerCase();
                const isPaid = invoiceStatus === 'paid' || paymentStatus === 'completed';
                return isConfirmed && !isPaid;
            });

            setAppointmentsNeedPayment(confirmedAndUnpaid);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handlePayAppointment = async (appointmentId) => {
        try {
            setPayingAppointmentId(appointmentId);
            await payAppointment(appointmentId, 'PayOS_QR');
            await fetchOrders();
            alert('Thanh toán lịch hẹn thành công.');
        } catch (error) {
            alert(error.message || 'Không thể thanh toán lịch hẹn.');
        } finally {
            setPayingAppointmentId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'ALL') return true;
        if (filter === 'CANCELLED') return order.Status === 'CANCELLED' || order.PaymentStatus === 'CANCELLED';
        return order.PaymentStatus === filter;
    });

    const getStatusCount = (status) => {
        if (status === 'ALL') return orders.length;
        if (status === 'CANCELLED') return orders.filter(o => o.Status === 'CANCELLED' || o.PaymentStatus === 'CANCELLED').length;
        return orders.filter(o => o.PaymentStatus === status).length;
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={{ 
                    minHeight: '80vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <h3 style={{ color: '#666' }}>Đang tải...</h3>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            
            <div style={{ 
                minHeight: '80vh', 
                background: '#f5f5f5', 
                paddingTop: '100px',
                paddingBottom: '40px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ 
                            fontSize: '24px', 
                            fontWeight: '600', 
                            color: '#1f2937',
                            marginBottom: '4px'
                        }}>
                            Đơn hàng của tôi
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '13px' }}>
                            Quản lý và theo dõi đơn hàng của bạn
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ 
                        background: 'white',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                    }}>
                        {[
                            { key: 'ALL', label: 'Tất cả', color: '#1a1a1a' },
                            { key: 'SUCCESS', label: 'Thành công', color: '#10b981' },
                            { key: 'PENDING', label: 'Chờ xử lý', color: '#f59e0b' },
                            { key: 'CANCELLED', label: 'Đã hủy', color: '#6b7280' },
                            { key: 'FAILED', label: 'Thất bại', color: '#ef4444' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                style={{
                                    padding: '6px 14px',
                                    border: filter === tab.key ? `1.5px solid ${tab.color}` : '1px solid #e5e7eb',
                                    background: filter === tab.key ? `${tab.color}08` : 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: filter === tab.key ? '500' : '400',
                                    color: filter === tab.key ? tab.color : '#6b7280',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {tab.label}
                                <span style={{
                                    background: filter === tab.key ? tab.color : '#9ca3af',
                                    color: 'white',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    minWidth: '18px',
                                    textAlign: 'center'
                                }}>
                                    {getStatusCount(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {appointmentsNeedPayment.length > 0 && (
                        <div style={{
                            background: 'white',
                            borderRadius: '6px',
                            padding: '16px',
                            marginBottom: '20px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                            border: '1px solid #facc15'
                        }}>
                            <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', color: '#92400e' }}>
                                Thanh toán lịch hẹn đã xác nhận
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {appointmentsNeedPayment.map((appt) => (
                                    <div
                                        key={appt.AppointmentID}
                                        style={{
                                            border: '1px solid #fde68a',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: '12px',
                                            flexWrap: 'wrap'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1f2937' }}>
                                                Lịch hẹn #{appt.AppointmentID}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {appt.ServiceNames || 'Dịch vụ khám'} • {(appt.TotalPrice || 0).toLocaleString('vi-VN')} ₫
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handlePayAppointment(appt.AppointmentID)}
                                            disabled={payingAppointmentId === appt.AppointmentID}
                                            style={{
                                                padding: '8px 14px',
                                                border: 'none',
                                                borderRadius: '4px',
                                                background: '#f59e0b',
                                                color: 'white',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                cursor: payingAppointmentId === appt.AppointmentID ? 'not-allowed' : 'pointer',
                                                opacity: payingAppointmentId === appt.AppointmentID ? 0.6 : 1
                                            }}
                                        >
                                            {payingAppointmentId === appt.AppointmentID ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '6px',
                            padding: '50px 20px',
                            textAlign: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                            <h3 style={{ color: '#1f2937', marginBottom: '6px', fontSize: '16px' }}>
                                Chưa có đơn hàng
                            </h3>
                            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '13px' }}>
                                Bạn chưa có đơn hàng nào trong danh sách này
                            </p>
                            <button
                                onClick={() => navigate('/product')}
                                style={{
                                    padding: '8px 20px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}
                            >
                                Mua sắm ngay
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredOrders.map(order => (
                                <OrderCard key={order.OrderID} order={order} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrdersPage;
