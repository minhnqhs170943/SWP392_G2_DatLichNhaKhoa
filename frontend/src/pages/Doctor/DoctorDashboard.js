import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import '../../styles/DoctorDashboard.css';


const mockDataTemplates = {
    daily: {
        metrics: { total: 15, completed: 12, newPatients: 4, revenue: 6500000 },
        combo: [{ time: '08:00', appointments: 3, revenue: 1500000 }, { time: '10:00', appointments: 5, revenue: 2000000 }, { time: '14:00', appointments: 4, revenue: 1500000 }, { time: '16:00', appointments: 3, revenue: 1500000 }],
        status: [{ name: 'Hoàn thành', value: 12 }, { name: 'Đã duyệt', value: 2 }, { name: 'Hủy', value: 1 }],
        topServices: [{ name: 'Lấy cao răng', count: 6 }, { name: 'Khám tổng quát', count: 5 }, { name: 'Trám răng', count: 4 }]
    }
};

const mockAppointments = {
    pending: [
        { id: 101, patient: "Trần Thế Anh", time: "08:30 Hôm nay", service: "Nhổ răng khôn" },
        { id: 102, patient: "Lê Minh Nghĩa", time: "09:15 Hôm nay", service: "Tư vấn Implant" },
        { id: 103, patient: "Phạm Hoàng Vũ", time: "10:00 Hôm nay", service: "Khám định kỳ" }
    ],
    approved: [
        { id: 201, patient: "Nguyễn Thị Mai", time: "14:00 Hôm nay", service: "Trám răng thẩm mỹ", isNext: true },
        { id: 202, patient: "Hoàng Văn Bách", time: "15:30 Hôm nay", service: "Lấy cao răng", isNext: false }
    ]
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const DoctorDashboard = () => {
    const [filterMode, setFilterMode] = useState('date');
    const [selectedDate, setSelectedDate] = useState('2026-04-19');
    
    const [data, setData] = useState(mockDataTemplates.daily);
    const [loading, setLoading] = useState(false);
    const [animate, setAnimate] = useState(false);

    const handleApplyFilter = () => {
        setLoading(true);
        setAnimate(false);
        setTimeout(() => {
            setData({...mockDataTemplates.daily}); 
            setLoading(false);
            setAnimate(true);
        }, 600);
    };

    useEffect(() => { handleApplyFilter(); }, []);

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                
                {/* --- HEADER --- */}
                <div className={`d-flex justify-content-between align-items-center mb-5 ${animate ? 'fade-in-up' : ''}`}>
                    <div>
                        <h1 className="fw-bolder gradient-text mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Hiệu suất thông minh</h1>
                        <p className="text-muted fw-medium mb-0">Hệ thống theo dõi phòng khám trực quan</p>
                    </div>
                    
                    <div className="glass-card p-2 rounded-pill d-flex align-items-center gap-2 px-3">
                        <select className="form-select form-select-sm border-0 fw-bold text-primary shadow-none bg-transparent"
                            value={filterMode} onChange={(e) => setFilterMode(e.target.value)} style={{ width: '150px', cursor: 'pointer' }}>
                            <option value="date">Lọc theo Ngày</option>
                            <option value="month">Lọc theo Tháng</option>
                        </select>
                        <div className="vr text-secondary opacity-25"></div>
                        <div className="d-flex align-items-center bg-white rounded-pill px-2 py-1 shadow-sm">
                            <input type="date" className="form-control form-control-sm border-0 shadow-none fw-medium" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                        </div>
                        <button className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow d-flex align-items-center gap-2" 
                                onClick={handleApplyFilter} disabled={loading} style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', border: 'none' }}>
                            {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-funnel-fill"></i>} Lọc
                        </button>
                    </div>
                </div>

                {/* --- 1. BỐN THẺ SỐ LIỆU --- */}
                <div className="row g-4 mb-5" style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.5s ease' }}>
                    {[
                        { title: 'Tổng ca khám', value: data.metrics.total, icon: 'bi-calendar-check', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                        { title: 'Ca hoàn thành', value: data.metrics.completed, icon: 'bi-check2-all', color: '#10b981', bg: 'rgba(16,185,129,0.1)', sub: `${data.metrics.total > 0 ? ((data.metrics.completed/data.metrics.total)*100).toFixed(1) : 0}% tỷ lệ hoàn thành` },
                        { title: 'Bệnh nhân mới', value: data.metrics.newPatients, icon: 'bi-person-plus', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                        { title: 'Tổng doanh thu', value: formatCurrency(data.metrics.revenue), icon: 'bi-cash-stack', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', isGradient: true }
                    ].map((card, idx) => (
                        <div key={idx} className={`col-md-3 ${animate ? `fade-in-up delay-${idx+1}` : ''}`}>
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

                {/* --- 2. BIỂU ĐỒ CHÍNH --- */}
                <div className={`glass-card rounded-4 mb-5 overflow-hidden ${animate ? 'fade-in-up delay-2' : ''}`} style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.5s ease' }}>
                    <div className="px-5 pt-4 pb-0">
                        <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-3">
                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 text-primary"><i className="bi bi-bar-chart-line-fill"></i></div> Tương quan Doanh thu & Lịch khám
                        </h5>
                    </div>
                    <div className="p-4" style={{ height: '350px' }}>
                        <ResponsiveContainer>
                            <ComposedChart data={data.combo} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#64748b', fontWeight: 600 }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(value, name) => name === 'Doanh thu' ? formatCurrency(value) : `${value} ca`} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Bar yAxisId="left" dataKey="appointments" name="Số ca khám" barSize={35} fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* --- 3. HAI BIỂU ĐỒ PHỤ (TỶ LỆ TRẠNG THÁI & TOP DỊCH VỤ) --- */}
                <div className="row g-5 mb-5" style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.5s ease' }}>
                    {/* Trạng thái Lịch */}
                    <div className={`col-lg-5 ${animate ? 'fade-in-up delay-3' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 p-xl-5">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning">
                                    <i className="bi bi-pie-chart-fill fs-5"></i>
                                </div>
                                <h5 className="fw-bolder text-dark mb-0">Tỷ lệ Trạng thái Lịch</h5>
                            </div>
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={data.status} innerRadius={75} outerRadius={105} paddingAngle={5} dataKey="value" stroke="none">
                                            {data.status.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 600 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Top Dịch vụ */}
                    <div className={`col-lg-7 ${animate ? 'fade-in-up delay-4' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 p-xl-5">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-info bg-opacity-10 rounded-3 text-info">
                                    <i className="bi bi-award-fill fs-5"></i>
                                </div>
                                <h5 className="fw-bolder text-dark mb-0">Top Dịch vụ thực hiện</h5>
                            </div>
                            <div style={{ height: '280px' }}>
                                <ResponsiveContainer>
                                    <BarChart layout="vertical" data={data.topServices} margin={{ top: 10, left: 40, right: 30, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis type="number" axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={130} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} formatter={(value) => [`${value} ca`, 'Số lượng']} />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={26}>
                                            {data.topServices.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#a78bfa'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. HAI BẢNG DANH SÁCH LỊCH KHÁM --- */}
                <div className="row g-5 pb-4" style={{ filter: loading ? 'blur(8px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'all 0.5s ease' }}>
                    
                    {/* Lịch Chờ Duyệt */}
                    <div className={`col-lg-6 ${animate ? 'fade-in-up delay-5' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
                                    <div className="p-2 bg-warning bg-opacity-10 rounded-3 text-warning"><i className="bi bi-hourglass-split"></i></div> Lịch chờ duyệt
                                </h5>
                                <Link to="/doctor/pending" className="btn btn-sm btn-light text-warning fw-bold rounded-pill px-3 shadow-sm border border-warning border-opacity-25">Xem tất cả</Link>
                            </div>
                            
                            <div className="flex-grow-1">
                                {mockAppointments.pending.map((apt) => (
                                    <div key={apt.id} className="d-flex justify-content-between align-items-center p-3 mb-3 bg-white bg-opacity-50 rounded-4 border border-white shadow-sm transition-all hover-scale cursor-pointer">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light rounded-3 p-2 text-center border" style={{ minWidth: '70px' }}>
                                                <small className="d-block text-muted" style={{fontSize: '10px'}}>GIỜ KHÁM</small>
                                                <strong className="text-dark">{apt.time.split(' ')[0]}</strong>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1 text-dark">{apt.patient}</h6>
                                                <span className="text-muted small"><i className="bi bi-bookmark-check text-primary me-1"></i> {apt.service}</span>
                                            </div>
                                        </div>
                                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm"><i className="bi bi-circle-fill small me-1 opacity-50" style={{fontSize: '8px'}}></i> Chờ duyệt</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sẵn Sàng Khám */}
                    <div className={`col-lg-6 ${animate ? 'fade-in-up delay-5' : ''}`}>
                        <div className="glass-card rounded-4 h-100 p-4 d-flex flex-column" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bolder text-dark mb-0 d-flex align-items-center gap-2">
                                    <div className="p-2 bg-success bg-opacity-10 rounded-3 text-success"><i className="bi bi-play-circle-fill"></i></div> Sẵn sàng khám
                                </h5>
                                <Link to="/doctor/consultation" className="btn btn-sm btn-success fw-bold rounded-pill px-3 shadow-sm">Tới phòng khám</Link>
                            </div>
                            
                            <div className="flex-grow-1">
                                {mockAppointments.approved.map((apt) => (
                                    <div key={apt.id} className={`d-flex justify-content-between align-items-center p-3 mb-3 rounded-4 border shadow-sm transition-all hover-scale ${apt.isNext ? 'bg-success bg-opacity-10 border-success border-opacity-50' : 'bg-white bg-opacity-50 border-white'}`}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`${apt.isNext ? 'bg-success text-white' : 'bg-light text-dark'} rounded-3 p-2 text-center shadow-sm`} style={{ minWidth: '70px' }}>
                                                <small className="d-block opacity-75" style={{fontSize: '10px'}}>{apt.isNext ? 'TIẾP THEO' : 'GIỜ KHÁM'}</small>
                                                <strong className={apt.isNext ? 'text-white' : 'text-dark'}>{apt.time.split(' ')[0]}</strong>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1 text-dark">{apt.patient}</h6>
                                                <span className="text-muted small"><i className="bi bi-clipboard2-check text-success me-1"></i> {apt.service}</span>
                                            </div>
                                        </div>
                                        <Link to={`/doctor/consultation/${apt.id}`} className={`btn btn-sm rounded-pill px-4 fw-bold shadow-sm ${apt.isNext ? 'btn-success' : 'btn-outline-success bg-white'}`}>
                                            Vào khám <i className="bi bi-arrow-right"></i>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;