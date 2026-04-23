import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const menuItems = [
        {
            path: '/admin/overview',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                </svg>
            ),
            label: 'Tổng quan',
            description: 'Vận hành hằng ngày'
        },
        {
            path: '/admin/stats',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            ),
            label: 'Thống kê (Analytics)',
            description: 'Phân tích tài chính'
        },
        {
            path: '/admin/appointments',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            ),
            label: 'Lịch Hẹn',
            description: 'Quản lý lịch hẹn'
        },
        {
            path: '/admin/services',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20"></path>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            label: 'Dịch Vụ',
            description: 'Quản lý dịch vụ'
        },
        {
            path: '/admin/products',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
            ),
            label: 'Sản phẩm',
            description: 'Quản lý sản phẩm'
        },
        {
            path: '/admin/blogs',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            label: 'Blog',
            description: 'Quản lý bài viết'
        },
        {
            path: '/admin/invoices',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            label: 'Hóa đơn',
            description: 'Quản lý hóa đơn'
        },
        {
            path: '/admin/reviews',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            ),
            label: 'Reviews',
            description: 'Review & từ cấm'
        },
        {
            path: '/admin/users',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            label: 'Người dùng',
            description: 'Quản lý tài khoản'
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                        </div>
                        {!sidebarCollapsed && <span className="logo-text">SMILE SYNC</span>}
                    </div>
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {sidebarCollapsed ? (
                                <polyline points="9 18 15 12 9 6"></polyline>
                            ) : (
                                <polyline points="15 18 9 12 15 6"></polyline>
                            )}
                        </svg>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            title={sidebarCollapsed ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && (
                                <div className="nav-content">
                                    <span className="nav-label">{item.label}</span>
                                    <span className="nav-description">{item.description}</span>
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/home" className="nav-item">
                        <span className="nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </span>
                        {!sidebarCollapsed && <span className="nav-label">Về trang chủ</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <h1 className="page-title">
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
                        </h1>
                    </div>
                    <div className="topbar-right">
                        <div className="user-menu">
                            <div className="user-info">
                                <span className="user-name">{user?.FullName}</span>
                                <span className="user-role">Administrator</span>
                            </div>
                            <button className="logout-btn" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
