import React from 'react';
import SidebarAdmin from '../../components/sidebar-admin/SidebarAdmin';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout-wrapper">
            <SidebarAdmin />
            <div className="admin-layout-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
