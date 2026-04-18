import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchCart } from '../services/cartApi';
import './../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartGlow, setCartGlow] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    // Mock notifications - sẽ thay bằng API sau
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Đơn hàng #123 đã được xác nhận',
            message: 'Đơn hàng đang được chuẩn bị',
            time: '2 giờ trước',
            isRead: false
        },
        {
            id: 2,
            title: 'Thanh toán thành công',
            message: 'Đơn hàng #122 - 150.000đ',
            time: '5 giờ trước',
            isRead: false
        },
        {
            id: 3,
            title: 'Khuyến mãi đặc biệt',
            message: 'Giảm giá 20% tất cả sản phẩm',
            time: '1 ngày trước',
            isRead: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: true } : notif
            )
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let mounted = true;
        const loadCartCount = async () => {
            if (!user) {
                if (mounted) setCartCount(0);
                return;
            }
            try {
                const rows = await fetchCart();
                const total = (rows || []).reduce((sum, item) => sum + (Number(item.Quantity) || 0), 0);
                if (mounted) setCartCount(total);
            } catch {
                if (mounted) setCartCount(0);
            }
        };

        const handleCartUpdated = () => {
            loadCartCount();
            setCartGlow(true);
            window.setTimeout(() => setCartGlow(false), 500);
        };

        loadCartCount();
        window.addEventListener('cart:updated', handleCartUpdated);

        return () => {
            mounted = false;
            window.removeEventListener('cart:updated', handleCartUpdated);
        };
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        alert("Đã đăng xuất");
        navigate('/home');
    };

    return (
        <nav className="custom-navbar">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    <Link to="/home" className="brand-link">
                        <div className="brand-logo">
                            <span>🦷</span>
                        </div>
                        <span className="brand-name">
                            SMILE SYNC
                        </span>
                    </Link>

                    <div className="d-none d-lg-flex align-items-center gap-4">
                        <Link to="/home" className="custom-nav-link">
                            Trang chủ
                        </Link>
                        <Link to="/booking" className="custom-nav-link">
                            Đặt Lịch
                        </Link>
                        <Link to="/product" className="custom-nav-link">
                            Sản Phẩm
                        </Link>
                        <Link to="/doctor" className="custom-nav-link">
                            Giới thiệu
                        </Link>
                        <Link to="/blogs" className="custom-nav-link">
                            Bài viết
                        </Link>
                        <Link to="/contact" className="custom-nav-link">
                            Liên hệ
                        </Link>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {user && (
                            <>
                                {/* Notifications Icon */}
                                <div style={{ position: 'relative' }} ref={notifRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        style={{
                                            position: 'relative',
                                            padding: '8px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        🔔
                                        {unreadCount > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '2px',
                                                right: '2px',
                                                background: '#ef4444',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                padding: '2px 5px',
                                                borderRadius: '10px',
                                                minWidth: '18px',
                                                textAlign: 'center'
                                            }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '8px',
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            width: '360px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            zIndex: 1000
                                        }}>
                                            <div style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #f3f4f6',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <h3 style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                    margin: 0
                                                }}>
                                                    Thông báo
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: '#3b82f6',
                                                        fontWeight: '500'
                                                    }}>
                                                        {unreadCount} mới
                                                    </span>
                                                )}
                                            </div>

                                            {notifications.slice(0, 3).map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => markAsRead(notif.id)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderBottom: '1px solid #f3f4f6',
                                                        cursor: 'pointer',
                                                        background: notif.isRead ? 'white' : '#eff6ff',
                                                        transition: 'background 0.2s',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? 'white' : '#eff6ff'}
                                                >
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                        {/* Icon chấm tròn */}
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            background: notif.isRead ? '#d1d5db' : '#3b82f6',
                                                            borderRadius: '50%',
                                                            marginTop: '6px',
                                                            flexShrink: 0
                                                        }} />
                                                        
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: '500',
                                                                color: '#1f2937',
                                                                marginBottom: '4px'
                                                            }}>
                                                                {notif.title}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#6b7280',
                                                                marginBottom: '4px'
                                                            }}>
                                                                {notif.message}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: '#9ca3af'
                                                            }}>
                                                                {notif.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    navigate('/notifications');
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'white',
                                                    border: 'none',
                                                    color: '#3b82f6',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >
                                                Xem tất cả thông báo
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Cart Icon */}
                                <Link to="/cart" className={`custom-nav-link cart-link ${cartGlow ? 'cart-glow' : ''}`} style={{ fontSize: '20px', position: 'relative' }}>
                                    🛒
                                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                                </Link>
                            </>
                        )}
                        {user ? (
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 12px',
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#1f2937'
                                    }}
                                >
                                    <span>Chào, {user.FullName}</span>
                                    <span style={{ fontSize: '12px' }}>▼</span>
                                </button>
                                
                                {showDropdown && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        minWidth: '200px',
                                        zIndex: 1000
                                    }}>
                                        <Link
                                            to="/orders"
                                            onClick={() => setShowDropdown(false)}
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: '#374151',
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.target.style.background = 'white'}
                                        >
                                            📦 Đơn hàng của tôi
                                        </Link>
                                        <Link
                                            to="/my-appointments"
                                            onClick={() => setShowDropdown(false)}
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: '#374151',
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.target.style.background = 'white'}
                                        >
                                            🗓️ Lịch hẹn của tôi
                                        </Link>
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: '#374151',
                                                textDecoration: 'none',
                                                fontSize: '14px',
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                            onMouseLeave={(e) => e.target.style.background = 'white'}
                                        >
                                            👤 Thông tin cá nhân
                                        </Link>
                                        {(user.RoleID === 1 || user.RoleID === 2) && (
                                            <Link
                                                to="/staff/dashboard"
                                                onClick={() => setShowDropdown(false)}
                                                style={{
                                                    display: 'block',
                                                    padding: '12px 16px',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >
                                                📊 Dashboard
                                            </Link>
                                        )}
                                        {(user.RoleID === 1 || user.RoleID === 2) && (
                                            <Link
                                                to="/staff/appointments"
                                                onClick={() => setShowDropdown(false)}
                                                style={{
                                                    display: 'block',
                                                    padding: '12px 16px',
                                                    color: '#374151',
                                                    textDecoration: 'none',
                                                    fontSize: '14px',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.target.style.background = 'white'}
                                            >
                                                📋 Quản lý lịch hẹn
                                            </Link>
                                        )}
                                        {user.RoleID === 1 && (
                                            <>
                                                <Link
                                                    to="/admin/products"
                                                    onClick={() => setShowDropdown(false)}
                                                    style={{
                                                        display: 'block',
                                                        padding: '12px 16px',
                                                        color: '#374151',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        borderBottom: '1px solid #f3f4f6',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                                >
                                                    ⚙️ Quản lý sản phẩm
                                                </Link>
                                                <Link
                                                    to="/admin/blogs"
                                                    onClick={() => setShowDropdown(false)}
                                                    style={{
                                                        display: 'block',
                                                        padding: '12px 16px',
                                                        color: '#374151',
                                                        textDecoration: 'none',
                                                        fontSize: '14px',
                                                        borderBottom: '1px solid #f3f4f6',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                                >
                                                    📝 Quản lý blog
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                handleLogout();
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                background: 'white',
                                                border: 'none',
                                                color: '#ef4444',
                                                textAlign: 'left',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                borderRadius: '0 0 6px 6px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                            onMouseLeave={(e) => e.target.style.background = 'white'}
                                        >
                                            🚪 Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn-login">Đăng nhập</Link>
                                <Link to="/register" className="btn-register">Đăng ký</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
