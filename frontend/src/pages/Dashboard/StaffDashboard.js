import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import './StaffDashboard.css';

// Trustworthy Business Blue palette
const COLORS = ['#2563eb', '#60a5fa', '#3b82f6', '#93c5fd', '#bfdbfe'];

const StaffDashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalRevenue: 0,
        todayAppointments: 0,
        pendingAppointments: [],
        revenueByMonth: [],
        appointmentsStatus: [],
        topServices: [],
        topDoctors: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/dashboard/stats');
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Lỗi lấy dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="staff-dashboard d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="staff-dashboard">
            <div className="container-fluid py-2">
                {/* Header Section */}
                <div className="dashboard-header d-flex justify-content-between align-items-end">
                    <div>
                        <h2>DENTAL CLINIC PERFORMANCE</h2>
                        <p>Staff Dashboard | Cập nhật theo thời gian thực</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row">
                    <div className="col-md-4">
                        <div className="saas-card stat-wrapper">
                            <span className="stat-title">TỔNG BỆNH NHÂN</span>
                            <span className="stat-value">{stats.totalPatients} <span style={{fontSize:'1rem', color:'#64748b', fontWeight:'500'}}>Người</span></span>
                            <span className="stat-trend trend-up">▲ +12% so với tháng trước</span>
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <div className="saas-card stat-wrapper">
                            <span className="stat-title">DOANH THU (NĂM NAY)</span>
                            <span className="stat-value">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
                            </span>
                            <span className="stat-trend trend-up">▲ +8% so với tháng trước</span>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="saas-card stat-wrapper">
                            <span className="stat-title">LỊCH KHÁM HÔM NAY</span>
                            <span className="stat-value">{stats.todayAppointments} <span style={{fontSize:'1rem', color:'#64748b', fontWeight:'500'}}>Ca</span></span>
                            <span className="stat-trend trend-down">▼ -2% so với tuần trước</span>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="row">
                    {/* Revenue Bar Chart */}
                    <div className="col-lg-8">
                        <div className="saas-card" style={{ height: '420px' }}>
                            <div className="chart-title">
                                THỐNG KÊ DOANH THU THEO THÁNG
                                <select className="form-select form-select-sm" style={{ width: 'auto', display: 'inline-block', borderColor: '#e2e8f0' }}>
                                    <option>Năm nay</option>
                                </select>
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

                {/* Charts Row 2 (Services & Doctors) */}
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
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8 }} name="Lượt Sử Dụng" />
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
    );
};

export default StaffDashboard;
