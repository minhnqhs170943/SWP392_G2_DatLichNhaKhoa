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
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
const monthOptions = [
    { value: '', label: 'Tất cả tháng' },
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' },
];

const dayOptions = [
    { value: '', label: 'Tất cả ngày' },
    ...Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: `Ngày ${i + 1}` }))
];

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
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(String(currentYear));

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            let url = `http://localhost:5001/api/dashboard/stats?year=${selectedYear}`;
            if (selectedMonth) {
                url += `&month=${selectedMonth}`;
            }
            if (selectedDay) {
                url += `&day=${selectedDay}`;
            }
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
    }, [selectedDay, selectedMonth, selectedYear]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleReset = () => {
        setSelectedDay('');
        setSelectedMonth('');
        setSelectedYear(String(currentYear));
    };

    const getFilterLabel = () => {
        if (selectedDay && selectedMonth) {
            return `Ngày ${selectedDay}/${selectedMonth}/${selectedYear}`;
        }
        if (selectedMonth) {
            return `Tháng ${selectedMonth}/${selectedYear}`;
        }
        return `Năm ${selectedYear}`;
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
                        <p>Staff Dashboard | Dữ liệu: {getFilterLabel()}</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-bar-label">
                        <CalendarDays size={18} />
                        <span>Bộ Lọc Thống Kê</span>
                    </div>
                    <div className="filter-bar-controls">
                        <select 
                            className="filter-select"
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {monthOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select 
                            className="filter-select"
                            value={selectedDay} 
                            onChange={(e) => setSelectedDay(e.target.value)}
                            disabled={!selectedMonth}
                            title={!selectedMonth ? "Chọn tháng trước để lọc theo ngày" : ""}
                        >
                            {dayOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select 
                            className="filter-select"
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={String(y)}>Năm {y}</option>
                            ))}
                        </select>
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
                            <span className="stat-title">
                                {selectedDay ? `LỊCH KHÁM NGÀY ${selectedDay}` : selectedMonth ? `LỊCH KHÁM THÁNG ${selectedMonth}` : 'LỊCH KHÁM HÔM NAY'}
                            </span>
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
                                THỐNG KÊ DOANH THU THEO THÁNG — NĂM {selectedYear}
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
                    {/* Top Services Line Chart */}
                    <div className="col-lg-6">
                        <div className="saas-card" style={{ height: '380px' }}>
                            <div className="chart-title">MẬT ĐỘ SỬ DỤNG DỊCH VỤ</div>
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={stats.topServices} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={4} activeDot={{ r: 8 }} name="Lượt Sử Dụng" />
                                </LineChart>
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
