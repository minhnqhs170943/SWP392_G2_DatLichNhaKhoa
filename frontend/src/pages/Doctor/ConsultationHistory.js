import 'bootstrap-icons/font/bootstrap-icons.css';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import { fetchConsultationHistory, fetchConsultationStatuses, fetchHistoryDetail } from '../../services/consultationHistoryApi';

const ConsultationHistory = () => {
    const [appointments, setAppointments] = useState([]);
    const [statusList, setStatusList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.UserID || user.id || user.doctorId;

    const navigate = useNavigate();

    useEffect(() => {
        const loadStatuses = async () => {
            try {
                const statuses = await fetchConsultationStatuses();
                setStatusList(statuses || []);
            } catch (err) {
                console.error("Lỗi lấy trạng thái:", err);
                setStatusList([]);
            }
        };
        loadStatuses();
    }, []);

    const loadConsultationHistory = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await fetchConsultationHistory(userId, searchTerm, startDate, endDate, filterStatus, currentPage, itemsPerPage);
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
    }, [userId, searchTerm, startDate, endDate, filterStatus, currentPage, itemsPerPage]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadConsultationHistory();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [loadConsultationHistory]);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const getStatusBadgeClass = (status) => {
        const normalized = String(status || '').trim().toLowerCase();
        if (normalized === 'completed') return 'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
        if (normalized === 'cancelled') return 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
        return 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25';
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await fetchHistoryDetail(id);
            if (res && res.info) { 
                setSelectedDetail(res); 
                setIsModalOpen(true);
            } else {
                alert("Không tìm thấy dữ liệu chi tiết.");
            }
        } catch (err) {
            alert("Lỗi khi tải chi tiết: " + err.message);
        }
    };

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
                    <div>
                        <h1 className="fw-bolder gradient-text mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Lịch sử Khám bệnh</h1>
                        <p className="text-muted fw-medium mb-0">Tra cứu các ca khám đã hoàn thành hoặc bị hủy</p>
                    </div>
                    <div className="glass-card px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 text-primary fw-bold">
                        <i className="bi bi-clock-history fs-5"></i>
                        Tổng: {totalRecords} ca
                    </div>
                </div>

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
                            <select className="form-select border-0 shadow-none bg-transparent text-muted fw-medium" value={filterStatus} onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}>
                                <option value="">Tất cả trạng thái</option>
                                {statusList?.map((status, idx) => <option key={idx} value={status}>{status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-4 p-4 p-xl-5 fade-in-up delay-2" style={{ filter: loading ? 'blur(4px)' : 'none', transition: 'all 0.3s ease' }}>
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted fw-medium">Đang tải danh sách...</p>
                        </div>
                    ) : totalRecords === 0 ? (
                        <div className="text-center py-5">
                            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted shadow-sm">
                                <i className="bi bi-inbox fs-1 text-secondary opacity-50"></i>
                            </div>
                            <h5 className="fw-bold text-dark">Không tìm thấy lịch sử nào</h5>
                            <p className="text-muted small">Vui lòng kiểm tra lại bộ lọc tìm kiếm.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-muted fw-bold rounded-start px-4">Mã lịch</th>
                                        <th className="text-muted fw-bold rounded-start px-4">THỜI GIAN</th>
                                        <th className="text-muted fw-bold">BỆNH NHÂN</th>
                                        <th className="text-muted fw-bold">DỊCH VỤ</th>
                                        <th className="text-muted fw-bold">TRẠNG THÁI</th>
                                        <th className="text-muted fw-bold text-end rounded-end px-4">THAO TÁC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((apt) => (
                                        <tr key={apt.id} className="bg-white">
                                            <td className="px-4 py-3">
                                                <span className="badge bg-white text-secondary px-4 py-2 rounded-pill fw-bold border shadow-sm fs-6">
                                                    <span className="text-primary me-1"></span>{apt.id}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-secondary bg-opacity-10 text-dark rounded-3 p-2 text-center shadow-sm" style={{ minWidth: '70px' }}>
                                                        <h5 className="fw-bold mb-0">{apt.time}</h5>
                                                    </div>
                                                    <span className="text-secondary fw-bold">
                                                        {apt.date.split('-').reverse().join('/')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <h6 className="fw-bold mb-1 text-dark">{apt.patientName}</h6>
                                                <span className="text-muted small"><i className="bi bi-telephone-fill me-1 opacity-50"></i>{apt.patientPhone}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-2 align-items-start">
                                                    {/* {apt.services.split(',').map((srv, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill fw-bold border border-info border-opacity-25 shadow-sm"
                                                        >
                                                            {srv.trim()}
                                                        </span>
                                                    ))} */}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge px-3 py-2 rounded-pill shadow-sm ${getStatusBadgeClass(apt.status)}`}>
                                                    {apt.status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                                                </span>
                                            </td>
                                            <td className="text-end px-4">
                                                <button
                                                    onClick={() => handleViewDetail(apt.id)}
                                                    className="btn btn-outline-primary rounded-pill px-4 py-2 shadow-sm fw-bold d-inline-flex align-items-center gap-2 hover-scale"
                                                >
                                                    Chi tiết <i className="bi bi-eye-fill fs-5"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalRecords > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                            <div className="d-flex align-items-center bg-white border rounded-pill px-3 py-1 shadow-sm">
                                <span className="text-muted small fw-medium me-2">Hiển thị:</span>
                                <select
                                    className="form-select form-select-sm border-0 bg-transparent shadow-none text-primary fw-bold"
                                    style={{ width: 'auto', cursor: 'pointer', paddingRight: '1.5rem', outline: 'none' }}
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                >
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
                                        <button className="page-link border-0 rounded-start-pill px-3 fw-bold text-secondary" onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className={`page-link border-0 fw-bold ${currentPage === i + 1 ? 'bg-primary text-white' : 'text-secondary'}`} onClick={() => setCurrentPage(i + 1)}>
                                                {i + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link border-0 rounded-end-pill px-3 fw-bold text-secondary" onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {isModalOpen && selectedDetail && (
                    <>
                        <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>

                        <div className="modal fade show d-block" style={{ zIndex: 1050 }}>
                            <div className="modal-dialog modal-dialog-centered modal-lg">
                                <div className="modal-content rounded-4 border-0 shadow-lg fade-in-up">
                                    <div className="modal-header border-0 pt-4 px-4 pb-2">
                                        <h5 className="modal-title fw-bolder text-primary d-flex align-items-center gap-2">
                                            <i className="bi bi-file-earmark-medical-fill"></i>
                                            Chi tiết ca khám #{selectedDetail.info.AppointmentID}
                                        </h5>
                                        <button type="button" className="btn-close shadow-none" onClick={() => setIsModalOpen(false)}></button>
                                    </div>

                                    <div className="modal-body px-4 py-3">
                                        <div className="row g-4">
                                            {/* CỘT TRÁI: THÔNG TIN KHÁM & BỆNH ÁN */}
                                            <div className="col-md-6 border-end">
                                                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                                    <h6 className="fw-bold text-muted mb-0">THÔNG TIN CA KHÁM</h6>
                                                    <span className={`badge rounded-pill ${getStatusBadgeClass(selectedDetail.info.Status)}`}>
                                                        {selectedDetail.info.Status === 'Completed' ? 'Hoàn thành' : 'Đã hủy'}
                                                    </span>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label className="small text-muted d-block">Bệnh nhân:</label>
                                                    <span className="fw-bold text-dark">{selectedDetail.info.patientName}</span>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="small text-muted d-block">Thời gian khám:</label>
                                                    <span className="text-secondary">{selectedDetail.info.date} - {selectedDetail.info.time}</span>
                                                </div>

                                                {/* [GIẢI THÍCH SỬA]: HIỂN THỊ LỜI NHẮN BỆNH NHÂN */}
                                                {selectedDetail.info.patientNote && (
                                                    <div className="mb-3 p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25 shadow-sm">
                                                        <label className="small text-info d-block fw-bold mb-1"><i className="bi bi-chat-left-text me-1"></i> Lời nhắn lúc đặt lịch:</label>
                                                        <p className="mb-0 text-dark fst-italic" style={{ whiteSpace: 'pre-line' }}>
                                                            "{selectedDetail.info.patientNote}"
                                                        </p>
                                                    </div>
                                                )}

                                                {/* [GIẢI THÍCH SỬA]: PHÂN NHÁNH HIỂN THỊ BỆNH ÁN HOẶC LÝ DO HỦY */}
                                                {selectedDetail.info.Status === 'Cancelled' ? (
                                                    <div className="p-3 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-25 shadow-sm">
                                                        <label className="small text-danger d-block fw-bold mb-1"><i className="bi bi-x-circle-fill me-1"></i> Lý do hủy lịch:</label>
                                                        <p className="mb-0 text-dark fw-medium" style={{ whiteSpace: 'pre-line' }}>
                                                            {selectedDetail.info.CancelReason || "Không ghi rõ lý do."}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-light rounded-3 border shadow-sm">
                                                        <label className="small text-muted d-block fw-bold mb-1"><i className="bi bi-journal-check text-success me-1"></i> Hồ sơ bệnh án / Chẩn đoán:</label>
                                                        <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-line' }}>
                                                            {selectedDetail.info.MedicalRecord || "Không có hồ sơ bệnh án."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CỘT PHẢI: ĐƠN THUỐC & TÁI KHÁM */}
                                            <div className="col-md-6">
                                                <h6 className="fw-bold text-muted border-bottom pb-2 mb-3">ĐƠN THUỐC & TÁI KHÁM</h6>

                                                <div className="prescription-list mb-4">
                                                    <label className="small text-muted fw-bold mb-2">Thuốc/Sản phẩm đã kê:</label>
                                                    {selectedDetail.products && selectedDetail.products.length > 0 ? (
                                                        <div className="table-responsive border rounded-3 overflow-hidden">
                                                            <table className="table table-sm table-hover mb-0">
                                                                <thead className="table-light">
                                                                    <tr className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                                        <th className="ps-3 py-2">TÊN SẢN PHẨM</th>
                                                                        <th className="text-center py-2">SL</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {selectedDetail.products.map((p, idx) => (
                                                                        <tr key={idx} className="align-middle bg-white">
                                                                            <td className="small fw-bold ps-3 py-2">{p.name}</td>
                                                                            <td className="text-center small py-2">
                                                                                <span className="badge bg-secondary rounded-pill">x{p.qty}</span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 bg-light rounded-3 text-center border border-dashed">
                                                            <p className="text-muted small fst-italic mb-0">Không kê thuốc/sản phẩm cho ca này.</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {selectedDetail.info.followUpDate && (
                                                    <div className="mt-4 p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25 shadow-sm">
                                                        <div className="d-flex align-items-center gap-2 text-warning fw-bold mb-1">
                                                            <i className="bi bi-calendar-check fs-5"></i>
                                                            <span>Hẹn tái khám: {selectedDetail.info.followUpDate}</span>
                                                        </div>
                                                        <div className="small text-muted fst-italic mt-2 bg-white p-2 rounded border">
                                                            "{selectedDetail.info.FollowUpNote || 'Không có dặn dò thêm'}"
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer border-0 pt-0 pb-4 px-4">
                                        <button className="btn btn-light rounded-pill px-5 fw-bold shadow-sm" onClick={() => setIsModalOpen(false)}>
                                            Đóng cửa sổ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConsultationHistory;