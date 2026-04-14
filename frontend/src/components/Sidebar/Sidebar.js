import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Settings, LogOut, Activity } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <Activity size={24} />
                </div>
                <h2>Nha Khoa Care</h2>
            </div>

            <div className="sidebar-menu">
                <div className="menu-label">Main Menu</div>

                <div className="nav-item">
                    <NavLink to="/staff-dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <LayoutDashboard />
                        <span>Tổng Quan</span>
                    </NavLink>
                </div>

                <div className="nav-item">
                    <NavLink to="/staff-appointments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                        <CalendarDays />
                        <span>Quản Lý Đặt Lịch</span>
                    </NavLink>
                </div>

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
                        S
                    </div>
                    <div className="user-info">
                        <h4>Staff Nhã Ca</h4>
                        <span>Lễ Tân</span>
                    </div>
                    <LogOut size={18} color="#94a3b8" style={{ marginLeft: 'auto', cursor: 'pointer' }} />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
