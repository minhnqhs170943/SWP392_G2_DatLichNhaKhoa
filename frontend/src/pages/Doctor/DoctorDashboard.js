import 'bootstrap-icons/font/bootstrap-icons.css';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Bar, BarChart, CartesianGrid, Cell,
    Legend, Pie, PieChart, ResponsiveContainer,
    Tooltip, XAxis, YAxis
} from 'recharts';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import { fetchDoctorDashboard, updateAppointmentStatus } from '../../services/doctorDashboardApi';
import '../../styles/DoctorDashboard.css';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

// --- CÁC HÀM HỖ TRỢ XỬ LÝ THỜI GIAN ---
const formatDateStandard = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getCurrentWeekStr = () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getStartDateOfWeek = (weekStr) => {
    if (!weekStr) return '';
    const [year, week] = weekStr.split('-W');
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return formatDateStandard(ISOweekStart);
};

const getEndDateOfWeek = (weekStr) => {
    if (!weekStr) return '';
    const [year, week] = weekStr.split('-W');
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    ISOweekStart.setDate(ISOweekStart.getDate() + 6); // Cộng thêm 6 ngày để ra Chủ Nhật
    return formatDateStandard(ISOweekStart);
};


const DoctorDashboard = () => {
    // 1. STATE QUẢN LÝ THỜI GIAN
    const [filterMode, setFilterMode] = useState('date');
    const [startValue, setStartValue] = useState(formatDateStandard(new Date()));
    const [endValue, setEndValue] = useState(formatDateStandard(new Date()));
    
    const [loading, setLoading] = useState(false);
    const [animate, setAnimate] = useState(false);

    const [data, setData] = useState({
        metrics: { total: 0, completed: 0, newPatients: 0, revenue: 0 },
        combo: [],
        status: [],
        topServices: [],
        appointments: { pending: [], approved: [] }
    });

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.UserID || user.id || user.doctorId;

    // 2. CHUYỂN ĐỔI CHẾ ĐỘ & SET GIÁ TRỊ MẶC ĐỊNH CHO INPUT
    const handleFilterModeChange = (e) => {
        const mode = e.target.value;
        setFilterMode(mode);
        const curr = new Date();

        if (mode === 'date') {
            const todayStr = formatDateStandard(curr);
            setStartValue(todayStr);
            setEndValue(todayStr);
        } else if (mode === 'week') {
            const weekStr = getCurrentWeekStr();
            setStartValue(weekStr);
            setEndValue(weekStr);
        } else if (mode === 'month') {
            const monthStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
            setStartValue(monthStr);
            setEndValue(monthStr);
        } else if (mode === 'year') {
            const yearStr = `${curr.getFullYear()}`;
            setStartValue(yearStr);
            setEndValue(yearStr);
        }
    };

    // 3. TÍNH TOÁN NGÀY THỰC TẾ & GỌI API
    const loadDashboardData = useCallback(async () => {
        if (!userId) return;

        let apiStart = startValue;
        let apiEnd = endValue;

        // Phiên dịch từ giá trị UI sang YYYY-MM-DD cho Backend
        if (filterMode === 'week') {
            apiStart = getStartDateOfWeek(startValue);
            apiEnd = getEndDateOfWeek(endValue);
        } else if (filterMode === 'month') {
            apiStart = `${startValue}-01`;
            const [y, m] = endValue.split('-');
            const lastDay = new Date(y, m, 0).getDate();
            apiEnd = `${endValue}-${lastDay}`;
        } else if (filterMode === 'year') {
            apiStart = `${startValue}-01-01`;
            apiEnd = `${endValue}-12-31`;
        }

        if (new Date(apiEnd) < new Date(apiStart)) {
            alert("Khoảng thời gian kết thúc không được nhỏ hơn thời gian bắt đầu!");
            return;
        }

        setLoading(true);
        setAnimate(false);
        try {
            const result = await fetchDoctorDashboard(userId, filterMode, apiStart, apiEnd);
            setData(result);
            setAnimate(true);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, filterMode, startValue, endValue]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleAction = async (appointmentId, nextStatus) => {
        let note = null;
        if (nextStatus === 'Cancelled') {
            note = prompt("Vui lòng nhập lý do hủy lịch khám này:");
            if (note === null) return;
        }

        try {
            setLoading(true);
            await updateAppointmentStatus(appointmentId, { status: nextStatus, note: note, doctorId: userId });
            await loadDashboardData();
        } catch (error) {
            alert("Cập nhật thất bại: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                {/* --- HEADER & DYNAMIC FILTER --- */}
                <div className={`d-flex justify-content-between align-items-center mb-5 ${animate ? 'fade-in-up' : ''}`}>
                    <div>
                        <h1 className="fw-bolder gradient-text mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Hiệu suất thông minh</h1>
                        <p className="text-muted fw-medium mb-0">Hệ thống theo dõi phòng khám trực quan</p>
                    </div>

                    <div className="glass-card p-2 rounded-pill d-flex align-items-center gap-2 px-3 shadow-sm bg-white border">
                        <select
                            className="form-select form-select-sm border-0 fw-bold text-primary bg-transparent shadow-none"
                            value={filterMode}
                            onChange={handleFilterModeChange}
                            style={{ width: '170px', cursor: 'pointer' }}
                        >
                            <option value="date">Nhóm theo Ngày</option>
                            <option value="week">Nhóm theo Tuần</option>
                            <option value="month">Nhóm theo Tháng</option>
                            <option value="year">Nhóm theo Năm</option>
                        </select>
                        
                        <div className="vr text-secondary opacity-25"></div>

                        {/* INPUT KHU VỰC - RENDER DỰA THEO FILTER MODE */}
                        <div className="d-flex align-items-center gap-2">
                            {filterMode === 'date' && (
                                <>
                                    <input type="date" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3" value={startValue} onChange={e => setStartValue(e.target.value)} />
                                    <i className="bi bi-arrow-right text-muted small"></i>
                                    <input type="date" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3" value={endValue} onChange={e => setEndValue(e.target.value)} />
                                </>
                            )}
                            {filterMode === 'week' && (
                                <>
                                    <input type="week" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3" value={startValue} onChange={e => setStartValue(e.target.value)} />
                                    <i className="bi bi-arrow-right text-muted small"></i>
                                    <input type="week" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3" value={endValue} onChange={e => setEndValue(e.target.value)} />
                                </>
                            )}
                            {filterMode === 'month' && (
                                <>
                                    <input type="month" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3" value={startValue} onChange={e => setStartValue(e.target.value)} />
                                    <i className="bi bi-arrow-right text-muted small"></i>
                                    <input type="month" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3" value={endValue} onChange={e => setEndValue(e.target.value)} />
                                </>
                            )}
                            {filterMode === 'year' && (
                                <>
                                    <input type="number" min="2000" max="2100" placeholder="Năm bắt đầu" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3 text-center" value={startValue} onChange={e => setStartValue(e.target.value)} style={{ width: '90px' }} />
                                    <i className="bi bi-arrow-right text-muted small"></i>
                                    <input type="number" min="2000" max="2100" placeholder="Năm kết thúc" className="form-control form-control-sm border-0 shadow-none fw-medium bg-light rounded-pill px-3 text-center" value={endValue} onChange={e => setEndValue(e.target.value)} style={{ width: '90px' }} />
                                </>
                            )}
                        </div>

                        <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 ms-2" onClick={loadDashboardData} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-funnel-fill"></i>} Lọc
                        </button>
                    </div>
                </div>

                {/* --- THẺ SỐ LIỆU --- */}
                <div className="row g-4 mb-5" style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                    {[
                        { title: 'Tổng ca khám', value: data.metrics.total, icon: 'bi-calendar-check', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                        { title: 'Ca hoàn thành', value: data.metrics.completed, icon: 'bi-check2-all', color: '#10b981', bg: 'rgba(16,185,129,0.1)', sub: `${data.metrics.total > 0 ? ((data.metrics.completed / data.metrics.total) * 100).toFixed(1) : 0}% tỷ lệ hoàn thành` },
                        { title: 'Bệnh nhân mới', value: data.metrics.newPatients, icon: 'bi-person-plus', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                        { title: 'Tổng doanh thu', value: formatCurrency(data.metrics.revenue), icon: 'bi-cash-stack', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', isGradient: true }
                    ].map((card, idx) => (
                        <div key={idx} className={`col-md-3 ${animate ? `fade-in-up delay-${idx + 1}` : ''}`}>
                            <div className="glass-card rounded-4 p-4 h-100" style={card.isGradient ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none' } : {}}>
                                <div className="d-flex align-items-center gap-4">
                                    <div className="metric-icon-wrapper p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: card.isGradient ? 'rgba(255,255,255,0.2)' : card.bg, color: card.isGradient ? 'white' : card.color }}>
                                        <i className={`bi ${card.icon} fs-3`}></i>
                                    </div>
                                    <div>
                                        <h6 className={`fw-bold text-uppercase tracking-wider mb-1 ${card.isGradient ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>{card.title}</h6>
                                        <h2 className="fw-black mb-0 tracking-tight" style={{ fontSize: card.isGradient ? '1.8rem' : '2.2rem' }}>{card.value}</h2>
                                        {card.sub && <small className="fw-bold mt-1 d-block" style={{ color: card.color }}>{card.sub}</small>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- BIỂU ĐỒ CHÍNH (CỘT ĐÔI: DOANH THU & SỐ CA KHÁM) --- */}
                <div className={`glass-card rounded-4 mb-5 overflow-hidden ${animate ? 'fade-in-up delay-2' : ''}`} style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                    <div className="px-5 pt-4 pb-0">
                        <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-3">
                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary"><i className="bi bi-bar-chart-fill"></i></div> Tương quan Số ca khám & Doanh thu
                        </h5>
                    </div>
                    <div className="p-4" style={{ height: '350px', minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.combo} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 13 }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} tick={{ fontSize: 13 }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} tick={{ fontSize: 13 }} />

                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(value, name) => name === 'Doanh thu' ? formatCurrency(value) : `${value} ca`} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />

                                <Bar yAxisId="left" dataKey="appointments" name="Số ca khám" barSize={25} fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                <Bar yAxisId="right" dataKey="revenue" name="Doanh thu" barSize={25} fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- HAI BIỂU ĐỒ PHỤ --- */}
                <div className="row g-5 mb-5" style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                    <div className={`col-lg-5 ${animate ? 'fade-in-up delay-3' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 p-xl-5">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning"><i className="bi bi-pie-chart-fill fs-5"></i></div>
                                <h5 className="fw-bolder text-dark mb-0">Tỷ lệ Trạng thái Lịch</h5>
                            </div>
                            <div style={{ height: '280px', minWidth: 0 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={data.status} innerRadius={75} outerRadius={105} paddingAngle={5} dataKey="value" stroke="none">
                                            {data.status.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 600 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className={`col-lg-7 ${animate ? 'fade-in-up delay-4' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 p-xl-5">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-info bg-opacity-10 rounded-3 text-info"><i className="bi bi-award-fill fs-5"></i></div>
                                <h5 className="fw-bolder text-dark mb-0">Top Dịch vụ thực hiện</h5>
                            </div>
                            <div style={{ height: '280px', minWidth: 0 }}>
                                <ResponsiveContainer>
                                    <BarChart layout="vertical" data={data.topServices} margin={{ top: 10, left: 40, right: 30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={130} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(value) => [`${value} ca`, 'Số lượng']} />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={26}>
                                            {data.topServices.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#a78bfa'} />))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- APPOINTMENT LISTS --- */}
                <div className="row g-4 pb-4" style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                    <div className={`col-lg-6 ${animate ? 'fade-in-up delay-5' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2"><div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning"><i className="bi bi-person-plus-fill"></i></div> Lịch mới phân công</h5>
                            </div>
                            <div className="flex-grow-1 appointment-list">
                                {data.appointments.pending.length === 0 ? (<p className="text-muted text-center py-4">Không có lịch mới cần duyệt.</p>) : (
                                    <>
                                        {data.appointments.pending.slice(0, 3).map((apt) => (
                                            <div key={apt.id} className="p-3 mb-3 bg-white bg-opacity-50 rounded-4 border shadow-sm d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light rounded-3 p-2 text-center border" style={{ minWidth: '70px' }}>
                                                        <small className="d-block text-muted" style={{ fontSize: '10px' }}>THỜI GIAN</small>
                                                        <strong className="text-dark">{apt.time.split(' ')[0]}</strong>
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-1 text-dark">{apt.patient}</h6>
                                                        <span className="text-muted small"><i className="bi bi-bookmark-check text-primary me-1"></i> {apt.service}</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button onClick={() => handleAction(apt.id, 'Approved')} className="btn btn-sm btn-success rounded-pill px-3 shadow-sm">Duyệt</button>
                                                    <button onClick={() => handleAction(apt.id, 'Cancelled')} className="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-sm">Hủy</button>
                                                </div>
                                            </div>
                                        ))}
                                        {data.appointments.pending.length > 3 && (
                                            <div className="text-center mt-3 pt-3 border-top">
                                                <Link to="/doctor/pending" className="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
                                                    Xem tất cả lịch chờ duyệt <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`col-lg-6 ${animate ? 'fade-in-up delay-5' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 d-flex flex-column border-success border-opacity-25">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2"><div className="p-2 bg-success bg-opacity-10 rounded-3 text-success"><i className="bi bi-play-circle-fill"></i></div> Sẵn sàng khám</h5>
                            </div>
                            <div className="flex-grow-1 appointment-list">
                                {data.appointments.approved.length === 0 ? (<p className="text-muted text-center py-4">Không có lịch hẹn sẵn sàng.</p>) : (
                                    <>
                                        {data.appointments.approved.slice(0, 3).map((apt) => (
                                            <div key={apt.id} className={`p-3 mb-3 rounded-4 border shadow-sm d-flex justify-content-between align-items-center ${apt.isNext ? 'bg-success bg-opacity-10 border-success border-opacity-50' : 'bg-white bg-opacity-50 border-white'}`}>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className={`${apt.isNext ? 'bg-success text-white' : 'bg-light text-dark'} rounded-3 p-2 text-center shadow-sm`} style={{ minWidth: '70px' }}>
                                                        <small className="d-block opacity-75" style={{ fontSize: '10px' }}>{apt.isNext ? 'TIẾP THEO' : 'THỜI GIAN'}</small>
                                                        <strong className={apt.isNext ? 'text-white' : 'text-dark'}>{apt.time.split(' ')[0]}</strong>
                                                    </div>
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1"><h6 className="fw-bold mb-0 text-dark">{apt.patient}</h6></div>
                                                        <span className="text-muted small"><i className="bi bi-clipboard2-check text-success me-1"></i> {apt.service}</span>
                                                    </div>
                                                </div>
                                                <Link to={`/doctor/consultation/${apt.id}`} className={`btn btn-sm rounded-pill px-4 fw-bold shadow-sm ${apt.isNext ? 'btn-success' : 'btn-outline-success bg-white'}`}>
                                                    Bắt đầu <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </div>
                                        ))}
                                        {data.appointments.approved.length > 0 && (
                                            <div className="text-center mt-3 pt-3 border-top">
                                                <Link to="/doctor/consultation" className="text-primary fw-bold text-decoration-none d-inline-flex align-items-center gap-1">
                                                    Bắt đầu khám <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;