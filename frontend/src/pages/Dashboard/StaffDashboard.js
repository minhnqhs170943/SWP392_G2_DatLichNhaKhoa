import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/SidebarStaff/Sidebar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { CalendarDays, RotateCcw } from 'lucide-react';
import './StaffDashboard.css';

// Trustworthy Business Blue palette
const COLORS = ['#2563eb', '#60a5fa', '#3b82f6', '#93c5fd', '#bfdbfe'];

const currentYear = new Date().getFullYear();

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalRevenue: 0,
        countAppointments: 0,
        revenueByMonth: [],
        appointmentsStatus: [],
        appointmentsByDay: [],
        topServices: [],
        topDoctors: []
    });
    const [loading, setLoading] = useState(true);

    // Filter state
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/dashboard/stats?startDate=${startDate}&endDate=${endDate}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleReset = () => {
        setStartDate(firstDayOfMonth);
        setEndDate(today);
    };

    const formatDateVN = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const getFilterLabel = () => {
        return `Từ ${formatDateVN(startDate)} đến ${formatDateVN(endDate)}`;
    };

    if (loading) {
        return (
            <div className="staff-dashboard d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
        <Sidebar />
        <div className="staff-dashboard" style={{ flex: 1, marginLeft: '260px', width: 'calc(100% - 260px)' }}>
            <div className="container-fluid py-2">
                {/* Header Section */}
                <div className="dashboard-header d-flex justify-content-between align-items-end">
                    <div>
                        <h2>DENTAL CLINIC PERFORMANCE</h2>
                        <p>Staff Dashboard | {getFilterLabel()}</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-bar-label">
                        <CalendarDays size={18} />
                        <span>Khoảng Thời Gian</span>
                    </div>
                    <div className="filter-bar-controls">
                        <div className="d-flex align-items-center gap-2">
                            <span style={{fontSize:'0.85rem', fontWeight:'600', color:'#64748b'}}>Từ:</span>
                            <input 
                                type="date" 
                                className="filter-select" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{fontSize:'0.85rem', fontWeight:'600', color:'#64748b'}}>Đến:</span>
                            <input 
                                type="date" 
                                className="filter-select" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button className="filter-reset-btn" onClick={handleReset} title="Reset về mặc định">
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row">
                    <div className="col-md-4">
                        <div className="saas-card stat-wrapper">
                            <span className="stat-title">TỔNG BỆNH NHÂN</span>
                            <span className="stat-value">{stats.totalPatients} <span style={{fontSize:'1rem', color:'#64748b', fontWeight:'500'}}>Người</span></span>
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <div className="saas-card stat-wrapper">
                            <span className="stat-title">DOANH THU ({getFilterLabel().toUpperCase()})</span>
                            <span className="stat-value">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                            </span>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="saas-card stat-wrapper">
                            <span className="stat-title">LỊCH KHÁM TRONG KHOẢNG</span>
                            <span className="stat-value">{stats.countAppointments} <span style={{fontSize:'1rem', color:'#64748b', fontWeight:'500'}}>Ca</span></span>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="row">
                    {/* Revenue Bar Chart */}
                    <div className="col-lg-8">
                        <div className="saas-card" style={{ height: '420px' }}>
                            <div className="chart-title">
                                THỐNG KÊ DOANH THU THEO THÁNG — NĂM {endDate ? new Date(endDate).getFullYear() : currentYear}
                            </div>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={stats.revenueByMonth} margin={{ top: 10, right: 10, left: 20, bottom: 5 }} barSize={35}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="revenue" fill="#1e40af" radius={[4, 4, 0, 0]} name="Doanh Thu (VNĐ)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Appointment Status Pie Chart */}
                    <div className="col-lg-4">
                        <div className="saas-card" style={{ height: '420px' }}>
                            <div className="chart-title">TRẠNG THÁI CUỘC HẸN</div>
                            <ResponsiveContainer width="100%" height="85%">
                                <PieChart>
                                    <Pie
                                        data={stats.appointmentsStatus}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.appointmentsStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 (Daily Stats) */}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="saas-card" style={{ height: '380px' }}>
                            <div className="chart-title">
                                XU HƯỚNG LỊCH HẸN THEO NGÀY — {getFilterLabel().toUpperCase()}
                            </div>
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={stats.appointmentsByDay} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} activeDot={{ r: 8 }} name="Số Lịch Hẹn" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 3 (Services & Doctors) */}
                <div className="row">
                    {/* Top Services Bar Chart */}
                    <div className="col-lg-6">
                        <div className="saas-card" style={{ height: '380px' }}>
                            <div className="chart-title">DỊCH VỤ PHỔ BIẾN NHẤT</div>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={stats.topServices} margin={{ top: 20, right: 30, left: 10, bottom: 5 }} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Lượt Sử Dụng" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Doctors Bar Chart */}
                    <div className="col-lg-6">
                        <div className="saas-card" style={{ height: '380px' }}>
                            <div className="chart-title">LƯỢT KHÁM CỦA BÁC SĨ</div>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={stats.topDoctors} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 12}} />
                                    <YAxis type="category" dataKey="name" stroke="#334155" tick={{fontSize: 12, fontWeight: 500}} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Số Lịch Hẹn" barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </div>
    );
};

export default StaffDashboard;
