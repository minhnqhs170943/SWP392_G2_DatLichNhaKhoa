import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchCart } from '../services/cartApi';
import './../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showDropdown, setShowDropdown] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [cartGlow, setCartGlow] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
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
                        <Link to="/home" className="brand-name">
                            SMILE SYNC
                        </Link>
                    </Link>

                    <div className="d-none d-lg-flex align-items-center gap-4">
                        <Link to="/home" className="custom-nav-link">
                            Trang chủ
                        </Link>
                        <Link to="/phong-kham" className="custom-nav-link">
                            Đặt Lịch
                        </Link>
                        <Link to="/product" className="custom-nav-link">
                            Sản Phẩm
                        </Link>
                        <Link to="/doctor" className="custom-nav-link">
                            Giới thiệu
                        </Link>
                        <Link to="/lien-he" className="custom-nav-link">
                            Liên hệ
                        </Link>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {user && (
                            <Link to="/cart" className={`custom-nav-link cart-link ${cartGlow ? 'cart-glow' : ''}`} style={{ fontSize: '20px' }}>
                                🛒
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
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
                                        {user.RoleID === 1 && (
                                            <Link
                                                to="/admin"
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
                                                ⚙️ Quản lý
                                            </Link>
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
