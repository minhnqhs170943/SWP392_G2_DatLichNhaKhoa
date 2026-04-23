import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// THÊM ReceiptText VÀO ĐÂY
import { LayoutDashboard, CalendarDays, Users, Settings, LogOut, Activity, ReceiptText } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        if(window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <Activity size={24} />
                </div>
                <h2>SMILE SYNC</h2>
            </div>

            <div className="sidebar-menu">
                <div className="menu-label">Main Menu</div>

                <div className="nav-item">
                    <NavLink to="/staff/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <LayoutDashboard />
                        <span>Tổng Quan</span>
                    </NavLink>
                </div>

                <div className="nav-item">
                    <NavLink to="/staff/appointments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <CalendarDays />
                        <span>Quản Lý Đặt Lịch</span>
                    </NavLink>
                </div>

                {user?.RoleID === 1 && (
                <div className="nav-item">
                    <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <Users />
                        <span>Quản Lý Người Dùng</span>
                    </NavLink>
                </div>
                )}
            </div>

            <div className="sidebar-footer">
                <div className="nav-item" style={{ marginBottom: '15px' }}>
                    <NavLink to="/settings" className="nav-link" onClick={(e) => e.preventDefault()} style={{ opacity: 0.5 }}>
                        <Settings />
                        <span>Cài Đặt</span>
                    </NavLink>
                </div>

                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.FullName ? user.FullName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="user-info">
                        <h4>{user?.FullName || 'Staff'}</h4>
                        <span>{user?.RoleID === 1 ? 'Admin' : 'Lễ Tân'}</span>
                    </div>
                    <LogOut size={18} color="#94a3b8" style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={handleLogout} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;