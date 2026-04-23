import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Users, CreditCard, Activity, CalendarDays, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminAnalytics.css';

const PIE_COLORS = ['#4318ff', '#6ad2ff', '#05cd99', '#ffb547'];
const ITEMS_PER_PAGE = 5;

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [appliedStart, setAppliedStart] = useState('');
    const [appliedEnd, setAppliedEnd] = useState('');

    // Pagination state for Service Profitability
    const [currentPage, setCurrentPage] = useState(1);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            let url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/analytics/overview`;
            if (appliedStart && appliedEnd) {
                url += `?startDate=${appliedStart}&endDate=${appliedEnd}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.payload);
                setCurrentPage(1); // Reset page on new data
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu phân tích', error);
        } finally {
            setLoading(false);
        }
    }, [appliedStart, appliedEnd]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleApplyFilter = () => {
        setAppliedStart(startDate);
        setAppliedEnd(endDate);
    };

    const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        setAppliedStart('');
        setAppliedEnd('');
    };

    if (loading || !analytics) {
        return (
            <div className="admin-dashboard d-flex align-items-center justify-content-center">
                <h3>Đang tải dữ liệu phân tích...</h3>
            </div>
        );
    }

    const { kpis, charts, audit } = analytics;

    // Pagination logic
    const serviceData = audit.serviceProfitability || [];
    const totalPages = Math.ceil(serviceData.length / ITEMS_PER_PAGE);
    const paginatedServices = serviceData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="admin-dashboard">
            {/* Board Header */}
            <div className="admin-header d-flex justify-content-between align-items-end">
                <div>
                    <h1>Phân Tích Thống Kê Chi Tiết</h1>
                    <p>Chỉ Số Hiệu Suất & Tài Chính Chuyên Sâu</p>
                </div>
                
                <div className="filter-panel d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border">
                        <CalendarDays size={18} className="text-muted" />
                        <span className="fw-medium text-secondary">Từ:</span>
                        <input type="date" className="border-0 bg-transparent outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm border">
                        <CalendarDays size={18} className="text-muted" />
                        <span className="fw-medium text-secondary">Đến:</span>
                        <input type="date" className="border-0 bg-transparent outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleApplyFilter}>
                        <Filter size={16} /> Lọc
                    </button>
                    {(appliedStart || appliedEnd) && (
                        <button className="btn btn-outline-secondary" onClick={handleResetFilter}>Khôi phục</button>
                    )}
                </div>
            </div>

            {/* Top KPI Widgets */}
            <div className="row mt-4">
                <div className="col-lg-4 col-md-6">
                    <div className="admin-kpi-card">
                        <div className="kpi-icon-wrapper revenue">
                            <CreditCard />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Tổng Doanh Thu Thuần</span>
                            <span className="kpi-value">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis.grossRevenue)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4 col-md-6">
                    <div className="admin-kpi-card">
                        <div className="kpi-icon-wrapper patients">
                            <Users />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Tổng Lượt Bệnh Nhân (Đã khám)</span>
                            <span className="kpi-value">{kpis.totalPatients}</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6">
                    <div className="admin-kpi-card">
                        <div className="kpi-icon-wrapper appointments">
                            <Activity />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Tỷ Lệ Nhận Lịch (Fill Rate)</span>
                            <span className="kpi-value">
                                {kpis.appointmentStats.TotalAppointments ? Math.round((kpis.appointmentStats.CompletedAppointments / kpis.appointmentStats.TotalAppointments) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphics Row 1 */}
            <div className="row">
                <div className="col-lg-8">
                    <div className="admin-data-card" style={{ height: '420px' }}>
                        <div className="admin-data-title">Biểu Đồ Tăng Trưởng Doanh Thu</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={charts.revenueTrend} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4318ff" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#a3aed1" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#a3aed1" tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#2b3674', color: 'white', borderRadius: '10px', padding: '15px', border: 'none' }} formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                                <Area type="monotone" dataKey="revenue" name="Doanh Thu" stroke="#4318ff" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="admin-data-card" style={{ height: '420px' }}>
                        <div className="admin-data-title">Phân Bổ Kênh Thanh Toán</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={charts.paymentMethods}
                                    cx="50%" cy="45%"
                                    innerRadius={70} outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="volume"
                                    nameKey="name"
                                    stroke="none"
                                >
                                    {charts.paymentMethods.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none' }} formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Graphics Row 2 */}
            <div className="row">
                <div className="col-lg-5">
                    <div className="admin-data-card" style={{ height: '400px' }}>
                        <div className="admin-data-title">Năng Suất Bác Sĩ (Doanh thu đem lại)</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={charts.revenueByDoctor} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="#a3aed1" tick={{fontSize: 13, fontWeight: 600}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#f4f7fe'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                                <Bar dataKey="value" name="Doanh thu" fill="#6ad2ff" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="admin-data-card" style={{ height: 'auto', minHeight: '400px' }}>
                        <div className="admin-data-title">Kiểm Toán Lợi Nhuận Dịch Vụ</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="service-table">
                                <thead>
                                    <tr>
                                        <th>Tên Dịch Vụ</th>
                                        <th>Đơn Giá</th>
                                        <th>Lượt Sử Dụng</th>
                                        <th>Tổng Lợi Nhuận Thu Về</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedServices.map((srv, idx) => (
                                        <tr key={idx}>
                                            <td>{srv.ServiceName}</td>
                                            <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(srv.UnitPrice)}</td>
                                            <td>{srv.UsageCount} lượt</td>
                                            <td className="currency-text">+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(srv.TotalYield)}</td>
                                        </tr>
                                    ))}
                                    {serviceData.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">Không có dữ liệu trong khoảng thời gian này</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-controls d-flex align-items-center justify-content-between mt-3 px-2">
                                <span className="text-muted" style={{ fontSize: '13px' }}>
                                    Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, serviceData.length)} / {serviceData.length} dịch vụ
                                </span>
                                <div className="d-flex align-items-center gap-2">
                                    <button 
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setCurrentPage(page)}
                                            style={{ minWidth: '32px' }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
