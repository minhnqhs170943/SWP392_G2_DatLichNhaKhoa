import React from 'react';
import Sidebar from '../components/SidebarStaff/Sidebar';
import './StaffLayout.css';

const StaffLayout = ({ children }) => {
    return (
        <div className="staff-layout">
            <Sidebar />
            <main className="staff-content">
                <div className="staff-content-inner">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;
