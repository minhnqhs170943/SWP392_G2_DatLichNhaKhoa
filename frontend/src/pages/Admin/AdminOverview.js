import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Briefcase, TrendingUp, Users, Activity, CalendarDays, RotateCcw } from 'lucide-react';
import './AdminOverview.css';

// Executive dark/gold palette
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
const monthOptions = [
    { value: '', label: 'Cả năm' },
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

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalRevenue: 0,
        countAppointments: 0,
        revenueByMonth: [],
        appointmentsStatus: [],
        topServices: [],
        topDoctors: []
    });
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(String(currentYear));

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            let url = `http://localhost:5000/api/dashboard/stats?year=${selectedYear}`;
            if (selectedMonth) {
                url += `&month=${selectedMonth}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Fetch overview error:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleReset = () => {
        setSelectedMonth('');
        setSelectedYear(String(currentYear));
    };

    if (loading) {
        return (
            <div className="admin-overview d-flex justify-content-center align-items-center" style={{ minHeight: '600px' }}>
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="admin-overview">
            <div className="overview-header d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="overview-title">TỔNG QUAN HOẠT ĐỘNG KHU PHÒNG KHÁM</h2>
                    <p className="overview-subtitle">Dashboard Vận Hành | Cập nhật Real-time</p>
                </div>
                <div className="overview-control-panel d-flex gap-2">
                    <div className="filter-group d-flex align-items-center">
                        <CalendarDays className="filter-icon" size={18}/>
                        <select className="executive-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select className="executive-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            {yearOptions.map(y => <option key={y} value={y}>Năm {y}</option>)}
                        </select>
                        <button className="executive-btn" onClick={handleReset} title="Reset">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="exec-kpi-card bg-gradient-blue text-white">
                        <div className="kpi-icon-box bg-white text-primary">
                            <Users size={24} />
                        </div>
                        <div className="kpi-info">
                            <p className="kpi-title">TỔNG BỆNH NHÂN</p>
                            <h3 className="kpi-value">{stats.totalPatients}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="exec-kpi-card bg-gradient-green text-white">
                        <div className="kpi-icon-box bg-white text-success">
                            <TrendingUp size={24} />
                        </div>
                        <div className="kpi-info">
                            <p className="kpi-title">DOANH THU ({selectedMonth ? `T${selectedMonth}` : 'Năm'})</p>
                            <h3 className="kpi-value">
                                {new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(stats.totalRevenue)}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="exec-kpi-card bg-gradient-purple text-white">
                        <div className="kpi-icon-box bg-white text-purple">
                            <Activity size={24} />
                        </div>
                        <div className="kpi-info">
                            <p className="kpi-title">LỊCH HẸN TRONG KỲ</p>
                            <h3 className="kpi-value">{stats.countAppointments}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Charts */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="exec-chart-card">
                        <h5 className="chart-header">Trường Doanh Thu Mở Rộng</h5>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.revenueByMonth} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} dy={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} 
                                           tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8 }} name="Doanh Thu (VNĐ)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="exec-chart-card">
                        <h5 className="chart-header">Tỷ Lệ Tình Trạng Lịch Hẹn</h5>
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.appointmentsStatus}
                                        cx="50%" cy="45%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.appointmentsStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="exec-chart-card">
                        <h5 className="chart-header">Top 5 Bác Sĩ Tích Cực</h5>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topDoctors} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis type="category" dataKey="name" stroke="#334155" tick={{fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={25} name="Số lịch" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="exec-chart-card">
                        <h5 className="chart-header">Dịch Vụ Phổ Biến Nhất</h5>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topServices} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11}} dy={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Lượt Sử Dụng" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
