import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserNotifications, markAsRead as markNotificationAsRead, markAllAsRead as markAllNotificationsAsRead } from '../services/notificationApi';

const NotificationsPage = () => {
    const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getUserNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAsRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.NotificationID === id ? { ...notif, IsRead: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, IsRead: true }))
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'ALL') return true;
        if (filter === 'UNREAD') return !notif.IsRead;
        if (filter === 'READ') return notif.IsRead;
        return true;
    });

    const getFilterCount = (filterType) => {
        if (filterType === 'ALL') return notifications.length;
        if (filterType === 'UNREAD') return notifications.filter(n => !n.IsRead).length;
        if (filterType === 'READ') return notifications.filter(n => n.IsRead).length;
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

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
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
                    {loading ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '6px',
                            padding: '50px 20px',
                            textAlign: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                        }}>
                            <p style={{ color: '#6b7280', fontSize: '13px' }}>Đang tải...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
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
                                    key={notif.NotificationID}
                                    onClick={() => markAsRead(notif.NotificationID)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '6px',
                                        padding: '16px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                        border: `1px solid ${notif.IsRead ? '#e5e7eb' : '#3b82f6'}`,
                                        borderLeft: `4px solid ${getTypeColor(notif.Type)}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.12)'}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)'}
                                >
                                    {!notif.IsRead && (
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
                                            {notif.Title}
                                        </h3>
                                        <p style={{
                                            fontSize: '13px',
                                            color: '#6b7280',
                                            marginBottom: '8px',
                                            lineHeight: '1.5'
                                        }}>
                                            {notif.Message}
                                        </p>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#9ca3af'
                                        }}>
                                            {formatTime(notif.CreatedAt)}
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
