import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ

    // Mock data - sẽ thay bằng API sau
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'ORDER',
            title: 'Đơn hàng #123 đã được xác nhận',
            message: 'Đơn hàng của bạn đang được chuẩn bị và sẽ sớm được giao',
            time: '2 giờ trước',
            isRead: false
        },
        {
            id: 2,
            type: 'PAYMENT',
            title: 'Thanh toán thành công',
            message: 'Bạn đã thanh toán thành công đơn hàng #122 với số tiền 150.000đ',
            time: '5 giờ trước',
            isRead: false
        },
        {
            id: 3,
            type: 'PROMOTION',
            title: 'Khuyến mãi đặc biệt',
            message: 'Giảm giá 20% cho tất cả sản phẩm chăm sóc răng miệng',
            time: '1 ngày trước',
            isRead: true
        },
        {
            id: 4,
            type: 'ORDER',
            title: 'Đơn hàng #121 đã giao thành công',
            message: 'Cảm ơn bạn đã mua hàng. Đánh giá sản phẩm để nhận ưu đãi',
            time: '2 ngày trước',
            isRead: true
        },
        {
            id: 5,
            type: 'SYSTEM',
            title: 'Cập nhật hệ thống',
            message: 'Hệ thống đã được cập nhật với nhiều tính năng mới',
            time: '3 ngày trước',
            isRead: true
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
        );
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'ALL') return true;
        if (filter === 'UNREAD') return !notif.isRead;
        if (filter === 'READ') return notif.isRead;
        return true;
    });

    const getFilterCount = (filterType) => {
        if (filterType === 'ALL') return notifications.length;
        if (filterType === 'UNREAD') return notifications.filter(n => !n.isRead).length;
        if (filterType === 'READ') return notifications.filter(n => n.isRead).length;
        return 0;
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'ORDER': return '#3b82f6';
            case 'PAYMENT': return '#10b981';
            case 'PROMOTION': return '#f59e0b';
            case 'SYSTEM': return '#6b7280';
            default: return '#6b7280';
        }
    };

    return (
        <div>
            <Navbar />
            
            <div style={{ 
                minHeight: '80vh', 
                background: '#f5f5f5', 
                paddingTop: '100px',
                paddingBottom: '40px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                    {/* Header */}
                    <div style={{ 
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}>
                        <div>
                            <h1 style={{ 
                                fontSize: '24px', 
                                fontWeight: '600', 
                                color: '#1f2937',
                                marginBottom: '4px'
                            }}>
                                Thông báo
                            </h1>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                                Cập nhật mới nhất về đơn hàng và khuyến mãi
                            </p>
                        </div>
                        {getFilterCount('UNREAD') > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    padding: '8px 16px',
                                    background: 'white',
                                    color: '#3b82f6',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#3b82f6';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'white';
                                    e.target.style.color = '#3b82f6';
                                }}
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
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
                            { key: 'UNREAD', label: 'Chưa đọc', color: '#3b82f6' },
                            { key: 'READ', label: 'Đã đọc', color: '#6b7280' }
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
                                    {getFilterCount(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Notifications List */}
                    {filteredNotifications.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '6px',
                            padding: '50px 20px',
                            textAlign: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                        }}>
                            <h3 style={{ color: '#1f2937', marginBottom: '6px', fontSize: '16px' }}>
                                Không có thông báo
                            </h3>
                            <p style={{ color: '#6b7280', fontSize: '13px' }}>
                                Bạn chưa có thông báo nào trong danh sách này
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredNotifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => markAsRead(notif.id)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '6px',
                                        padding: '16px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                        border: `1px solid ${notif.isRead ? '#e5e7eb' : '#3b82f6'}`,
                                        borderLeft: `4px solid ${getTypeColor(notif.type)}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.12)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)'}
                                >
                                    {!notif.isRead && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '16px',
                                            right: '16px',
                                            width: '8px',
                                            height: '8px',
                                            background: '#3b82f6',
                                            borderRadius: '50%'
                                        }} />
                                    )}
                                    
                                    <div>
                                        <h3 style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1f2937',
                                            marginBottom: '6px'
                                        }}>
                                            {notif.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            marginBottom: '8px',
                                            lineHeight: '1.5'
                                        }}>
                                            {notif.message}
                                        </p>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#9ca3af'
                                        }}>
                                            {notif.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default NotificationsPage;
