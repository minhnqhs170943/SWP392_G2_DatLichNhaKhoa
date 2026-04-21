import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Settings, LogOut, Package } from 'lucide-react';
import './SidebarAdmin.css';

const SidebarAdmin = () => {
    return (
        <div className="sidebar-admin-container">
            <div className="sidebar-admin-header">
                <div className="logo-icon-admin">
                    <Activity size={24} />
                </div>
                <h2>Admin Portal</h2>
            </div>

            <div className="sidebar-admin-menu">
                <div className="menu-label-admin">QUẢN TRỊ VIÊN</div>

                <div className="nav-item-admin">
                    <NavLink to="/admin-analytics" className={({ isActive }) => isActive ? "nav-link-admin active" : "nav-link-admin"}>
                        <LayoutDashboard size={20} />
                        <span>Thống Kê</span>
                    </NavLink>
                </div>

                <div className="nav-item-admin">
                    <NavLink to="/admin/user" className={({ isActive }) => isActive ? "nav-link-admin active" : "nav-link-admin"}>
                        <Users size={20} />
                        <span>Người Dùng</span>
                    </NavLink>
                </div>

                <div className="nav-item-admin">
                    <NavLink to="/admin/products" className={({ isActive }) => isActive ? "nav-link-admin active" : "nav-link-admin"}>
                        <Package size={20} />
                        <span>Sản Phẩm</span>
                    </NavLink>
                </div>

            </div>

            <div className="sidebar-admin-footer">
                <div className="nav-item-admin" style={{ marginBottom: '15px' }}>
                    <NavLink to="/settings" className="nav-link-admin" onClick={(e) => e.preventDefault()} style={{ opacity: 0.5 }}>
                        <Settings size={20} />
                        <span>Cài Đặt</span>
                    </NavLink>
                </div>

                <div className="admin-profile">
                    <div className="admin-avatar">
                        A
                    </div>
                    <div className="admin-info">
                        <h4>Quản Trị Viên</h4>
                        <span>Admin</span>
                    </div>
                    <LogOut size={18} color="#a3bae3" style={{ marginLeft: 'auto', cursor: 'pointer' }} />
                </div>
            </div>
        </div>
    );
};

export default SidebarAdmin;
