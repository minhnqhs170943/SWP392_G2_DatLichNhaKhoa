import 'bootstrap-icons/font/bootstrap-icons.css';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import { fetchConsultationList, fetchConsultationServices } from '../../services/consultationListApi';

const ConsultationList = () => {
    const [appointments, setAppointments] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 'list' hoặc 'schedule'
    const [viewMode, setViewMode] = useState('list');

    // State cho Lịch ngày (Daily Schedule)
    const [currentDate, setCurrentDate] = useState(new Date());

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterService, setFilterService] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.UserID || user.id || user.doctorId;

    const navigate = useNavigate();

    useEffect(() => {
        const loadServices = async () => {
            try {
                const srvs = await fetchConsultationServices();
                setServicesList(srvs || []);
            } catch (err) {
                setServicesList([]);
            }
        };
        loadServices();
    }, []);

    const loadApprovedAppointments = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const fetchLimit = viewMode === 'schedule' ? 100 : itemsPerPage;

            const response = await fetchConsultationList(userId, searchTerm, startDate, endDate, filterService, currentPage, fetchLimit);
            const fetchedData = response?.data || (Array.isArray(response) ? response : []);

            setAppointments(fetchedData);
            setTotalPages(response?.totalPages || 1);
            setTotalRecords(response?.total || fetchedData.length);
            setCurrentPage(response?.currentPage || 1);
        } catch (error) {
            console.error(error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [userId, searchTerm, startDate, endDate, filterService, currentPage, itemsPerPage, viewMode]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadApprovedAppointments();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [loadApprovedAppointments]);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // --- LOGIC CHO LỊCH NGÀY (DAILY SCHEDULE) ---
    const prevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        setCurrentDate(prev);
    };

    const nextDay = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };

    const goToToday = () => setCurrentDate(new Date());

    const formatToDDMMYYYY = (dateObj) => {
        const d = String(dateObj.getDate()).padStart(2, '0');
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const formattedCurrentDate = formatToDDMMYYYY(currentDate);
    const dailyAppointments = appointments.filter(apt => apt.date === formattedCurrentDate);

    // Format ngày hiển thị trên Header của Lịch
    const displayDateString = currentDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                {/* --- HEADER --- */}
                <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
                    <div>
                        <h1 className="fw-bolder gradient-text mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Lịch Khám Bệnh</h1>
                        <p className="text-muted fw-medium mb-0">Quản lý và thực hiện các ca khám theo ngày</p>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                        {/* Thanh chuyển đổi ViewMode */}
                        <div className="bg-white p-1 rounded-pill shadow-sm border d-flex gap-1">
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${viewMode === 'list' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                onClick={() => { setViewMode('list'); setCurrentPage(1); }}
                            >
                                <i className="bi bi-list-ul me-1"></i> Dạng Bảng
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${viewMode === 'schedule' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                                onClick={() => { setViewMode('schedule'); setCurrentPage(1); }}
                            >
                                <i className="bi bi-clock-history me-1"></i> Lịch Ngày (Timeline)
                            </button>
                        </div>
                    </div>
                </div>

                {/* BỘ LỌC (Chỉ hiện ở dạng Bảng) */}
                {viewMode === 'list' && (
                    <div className="row g-3 mb-4 fade-in-up delay-1">
                        <div className="col-md-4">
                            <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border border-light">
                                <span className="input-group-text bg-transparent border-0 text-primary"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-0 shadow-none bg-transparent fw-medium py-2" placeholder="Tìm tên, SĐT bệnh nhân..." value={searchTerm} onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border border-light">
                                <span className="input-group-text bg-transparent border-0 text-success"><i className="bi bi-calendar-range"></i></span>
                                <input type="date" className="form-control border-0 shadow-none bg-transparent fw-medium py-2" value={startDate} onChange={(e) => handleFilterChange(setStartDate, e.target.value)} />
                                <span className="bg-transparent border-0 d-flex align-items-center px-1 text-muted">→</span>
                                <input type="date" className="form-control border-0 shadow-none bg-transparent fw-medium py-2" value={endDate} onChange={(e) => handleFilterChange(setEndDate, e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white">
                                <span className="input-group-text bg-transparent border-0 text-info"><i className="bi bi-heart-pulse"></i></span>
                                <select className="form-select border-0 shadow-none bg-transparent text-muted fw-medium" value={filterService} onChange={(e) => handleFilterChange(setFilterService, e.target.value)}>
                                    <option value="">Tất cả dịch vụ</option>
                                    {servicesList?.map((srv, idx) => <option key={idx} value={srv}>{srv}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card rounded-4 p-4 p-xl-5 fade-in-up delay-2" style={{ filter: loading ? 'blur(4px)' : 'none', transition: 'all 0.3s ease' }}>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted fw-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        /* HIỂN THỊ DẠNG BẢNG (LIST VIEW) */
                        totalRecords === 0 ? (
                            <div className="text-center py-5">
                                <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted shadow-sm">
                                    <i className="bi bi-clipboard-x fs-1 text-danger opacity-50"></i>
                                </div>
                                <h5 className="fw-bold text-dark">Hiện tại không có ca khám nào</h5>
                                <p className="text-muted small">Vui lòng kiểm tra lại bộ lọc.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-muted fw-bold rounded-start px-4">Mã đặt lịch</th>
                                            <th className="text-muted fw-bold px-4">THỜI GIAN</th>
                                            <th className="text-muted fw-bold">BỆNH NHÂN</th>
                                            <th className="text-muted fw-bold">DỊCH VỤ</th>
                                            <th className="text-muted fw-bold">TRẠNG THÁI</th>
                                            <th className="text-muted fw-bold text-end rounded-end px-4">THAO TÁC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((apt) => (
                                            <tr key={apt.id} className="bg-white border-bottom">
                                                <td className="px-4 py-3">
                                                    <span className="badge bg-white text-secondary px-3 py-2 rounded-pill fw-bold border shadow-sm">#{apt.id}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className="fw-bold text-primary">{apt.time}</span>
                                                        <span className="text-muted small">| {apt.date}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <h6 className="fw-bold mb-0 text-dark">{apt.patientName}</h6>
                                                    <span className="text-muted small">{apt.patientPhone}</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill fw-bold border border-info border-opacity-10">
                                                        {apt.services}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-bold border border-success border-opacity-10">
                                                        <i className="bi bi-check-circle-fill me-1"></i> Đã duyệt
                                                    </span>
                                                </td>
                                                <td className="text-end px-4">
                                                    <button onClick={() => navigate(`/doctor/consultation/${apt.id}`)} className="btn btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold hover-scale">
                                                        Khám ngay
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        /* HIỂN THỊ DẠNG LỊCH NGÀY (DAILY TIMELINE VIEW) */
                        <div className="daily-schedule-view">
                            {/* Thanh công cụ chọn ngày */}
                            <div className="d-flex justify-content-between align-items-center mb-5 bg-light p-3 rounded-4 border shadow-sm">
                                <button className="btn btn-white shadow-sm border fw-bold rounded-pill px-4" onClick={prevDay}>
                                    <i className="bi bi-chevron-left me-1"></i> Ngày trước
                                </button>

                                <div className="text-center cursor-pointer hover-scale" onClick={goToToday} title="Trở về hôm nay">
                                    <h4 className="fw-bolder text-primary mb-0 text-capitalize">
                                        {displayDateString}
                                    </h4>
                                    {formattedCurrentDate === formatToDDMMYYYY(new Date()) && (
                                        <span className="badge bg-success rounded-pill mt-1">Hôm nay</span>
                                    )}
                                </div>

                                <button className="btn btn-white shadow-sm border fw-bold rounded-pill px-4" onClick={nextDay}>
                                    Ngày sau <i className="bi bi-chevron-right ms-1"></i>
                                </button>
                            </div>

                            {/* Trục Timeline (Timeline Axis) */}
                            <div className="timeline-wrapper position-relative py-2 ms-4 ps-4" style={{ borderLeft: '3px dashed #dee2e6' }}>
                                {dailyAppointments.length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted shadow-sm">
                                            <i className="bi bi-calendar-x fs-1 opacity-50"></i>
                                        </div>
                                        <h5 className="fw-bold text-secondary">Không có ca khám nào trong ngày này</h5>
                                    </div>
                                ) : (
                                    dailyAppointments.map((apt, index) => (
                                        <div key={apt.id} className="timeline-item position-relative mb-5 fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                            {/* Điểm mốc trên Timeline */}
                                            <div className="position-absolute" style={{ left: '-39px', top: '25px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#fff', border: '5px solid #0d6efd', boxShadow: '0 0 0 4px rgba(13, 110, 253, 0.15)' }}></div>

                                            <div className="glass-card p-4 rounded-4 shadow-sm bg-white hover-scale border-0 border-start border-4 border-primary position-relative overflow-hidden">
                                                {/* Giờ mờ phía sau làm background (Watermark) */}
                                                {/* <div className="position-absolute end-0 top-0 opacity-10 text-primary fw-bolder" style={{ fontSize: '4.5rem', marginRight: '-1rem', marginTop: '-1rem', pointerEvents: 'none' }}>
                                                    {apt.time.split(':')[0]}h
                                                </div> */}

                                                <div className="row align-items-center">
                                                    <div className="col-md-2 text-center border-end">
                                                        <h3 className="fw-bolder text-primary mb-0">{apt.time}</h3>
                                                        <span className="text-muted small fw-bold">#{apt.id}</span>
                                                    </div>
                                                    <div className="col-md-4 ps-4">
                                                        <h5 className="fw-bold text-dark mb-1">{apt.patientName}</h5>
                                                        <div className="d-flex gap-2 text-muted small">
                                                            <span><i className="bi bi-telephone-fill me-1"></i> {apt.patientPhone}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="text-muted small d-block mb-1 fw-bold text-uppercase">Dịch vụ chỉ định</label>
                                                        <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill fw-bold border border-info border-opacity-25 shadow-sm">
                                                            {apt.services}
                                                        </span>
                                                    </div>
                                                    <div className="col-md-3 text-end">
                                                        <button onClick={() => navigate(`/doctor/consultation/${apt.id}`)} className="btn btn-primary rounded-pill px-4 py-2 shadow fw-bold">
                                                            Bắt đầu khám <i className="bi bi-arrow-right ms-1"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* PHÂN TRANG (Chỉ hiện ở dạng List) */}
                    {!loading && totalRecords > 0 && viewMode === 'list' && (
                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                            <div className="d-flex align-items-center bg-white border rounded-pill px-3 py-1 shadow-sm">
                                <span className="text-muted small fw-medium me-2">Hiển thị:</span>
                                <select className="form-select form-select-sm border-0 bg-transparent shadow-none text-primary fw-bold" style={{ width: 'auto' }} value={itemsPerPage} onChange={handleItemsPerPageChange}>
                                    <option value={5}>5 ca</option>
                                    <option value={10}>10 ca</option>
                                    <option value={20}>20 ca</option>
                                </select>
                                <div className="vr text-secondary opacity-25 mx-2"></div>
                                <span className="text-muted small fw-medium">Trang <span className="fw-bold text-dark">{currentPage}</span> / {totalPages}</span>
                            </div>

                            {totalPages > 1 && (
                                <ul className="pagination pagination-sm mb-0 shadow-sm">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link border-0 rounded-start-pill px-3 fw-bold" onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className={`page-link border-0 fw-bold ${currentPage === i + 1 ? 'bg-primary text-white' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link border-0 rounded-end-pill px-3 fw-bold" onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationList;