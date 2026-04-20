import 'bootstrap-icons/font/bootstrap-icons.css';
import { useCallback, useEffect, useState } from 'react';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import { fetchDoctorServices, fetchPendingAppointments, updateAppointmentStatus } from '../../services/doctorPendingApi';

const DoctorPending = () => {
    const [appointments, setAppointments] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterService, setFilterService] = useState('');

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Modal Hủy/Từ chối lịch
    const [cancelModal, setCancelModal] = useState({ isOpen: false, appointmentId: null, note: '' });

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.UserID || user.id || user.doctorId;

    useEffect(() => {
        const loadServices = async () => {
            try {
                const srvs = await fetchDoctorServices();
                setServicesList(srvs || []);
            } catch (err) {
                console.error("Lỗi lấy dịch vụ:", err);
                setServicesList([]);
            }
        };
        loadServices();
    }, []);

    const loadPendingAppointments = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await fetchPendingAppointments(userId, searchTerm, startDate, endDate, filterService, currentPage, itemsPerPage);
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
    }, [userId, searchTerm, startDate, endDate, filterService, currentPage, itemsPerPage]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadPendingAppointments();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [loadPendingAppointments]);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // --- CÁC HÀM XỬ LÝ DUYỆT VÀ TỪ CHỐI LỊCH ---
    const handleApprove = async (appointmentId) => {
        try {
            setLoading(true);
            await updateAppointmentStatus(appointmentId, { status: 'Approved', note: null, doctorId: userId });
            await loadPendingAppointments(); // Tải lại danh sách sau khi duyệt
        } catch (error) {
            alert("Lỗi khi duyệt lịch: " + error.message);
            setLoading(false);
        }
    };

    const openCancelModal = (appointmentId) => setCancelModal({ isOpen: true, appointmentId, note: '' });
    const closeCancelModal = () => setCancelModal({ isOpen: false, appointmentId: null, note: '' });

    const submitCancel = async () => {
        if (!cancelModal.note.trim()) {
            alert("Vui lòng nhập lý do từ chối để thông báo cho lễ tân/bệnh nhân.");
            return;
        }
        try {
            setLoading(true);
            await updateAppointmentStatus(cancelModal.appointmentId, { status: 'Cancelled', note: cancelModal.note, doctorId: userId });
            closeCancelModal();
            await loadPendingAppointments(); // Tải lại danh sách sau khi hủy
        } catch (error) {
            alert("Lỗi khi hủy lịch: " + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)', position: 'relative' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 fade-in-up">
                    <div>
                        <h1 className="fw-bolder gradient-text mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Lịch Chờ Duyệt</h1>
                        <p className="text-muted fw-medium mb-0">Danh sách các ca khám mới cần bác sĩ xác nhận</p>
                    </div>
                    <div className="glass-card px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 text-warning fw-bold">
                        <i className="bi bi-hourglass-split fs-5"></i>
                        Chờ xử lý: {totalRecords} ca
                    </div>
                </div>

                <div className="row g-3 mb-4 fade-in-up delay-1">
                    <div className="col-md-4">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white">
                            <span className="input-group-text bg-transparent border-0 text-primary"><i className="bi bi-search"></i></span>
                            <input type="text" className="form-control border-0 shadow-none bg-transparent fw-medium" placeholder="Tìm kiếm tên bệnh nhân..." value={searchTerm} onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)} />
                        </div>
                    </div>
                    {/* <div className="col-md-4">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white">
                            <span className="input-group-text bg-transparent border-0 text-success"><i className="bi bi-calendar-event"></i></span>
                            <input type="date" className="form-control border-0 shadow-none bg-transparent text-muted fw-medium" value={filterDate} onChange={(e) => handleFilterChange(setFilterDate, e.target.value)} />
                        </div>
                    </div> */}
                    <div className="col-md-4">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white">
                            <span className="input-group-text bg-transparent border-0 text-success"><i className="bi bi-calendar-range"></i></span>
                            <input
                                type="date"
                                className="form-control border-0 shadow-none bg-transparent text-muted fw-medium py-2"
                                value={startDate}
                                onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                            />
                            <span className="bg-transparent border-0 d-flex align-items-center px-1 text-muted">→</span>
                            <input
                                type="date"
                                className="form-control border-0 shadow-none bg-transparent text-muted fw-medium py-2"
                                value={endDate}
                                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                            />
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

                <div className="glass-card rounded-4 p-4 p-xl-5 fade-in-up delay-2" style={{ filter: loading && !cancelModal.isOpen ? 'blur(4px)' : 'none', transition: 'all 0.3s ease' }}>
                    {loading && appointments?.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted fw-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : (!loading && appointments?.length === 0 && !searchTerm && !startDate && !endDate && !filterService) ? (
                        <div className="text-center py-5">
                            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted shadow-sm">
                                <i className="bi bi-check-circle-fill fs-1 text-success opacity-50"></i>
                            </div>
                            <p className="text-muted">Không có lịch khám mới nào đang chờ duyệt.</p>
                        </div>
                    ) : appointments?.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
                            <h5 className="fw-bold text-dark">Không tìm thấy kết quả</h5>
                            <p className="text-muted small">Vui lòng thử điều kiện tìm kiếm hoặc chọn ngày khác.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-muted fw-bold rounded-start px-4">THỜI GIAN</th>
                                        <th className="text-muted fw-bold">BỆNH NHÂN</th>
                                        <th className="text-muted fw-bold">DỊCH VỤ</th>
                                        <th className="text-muted fw-bold">GHI CHÚ</th>
                                        <th className="text-muted fw-bold text-end rounded-end px-4">THAO TÁC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments?.map((apt) => (
                                        <tr key={apt.id} className="bg-white">
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 text-center shadow-sm" style={{ minWidth: '70px' }}>
                                                        <h5 className="fw-bold mb-0">{apt.time}</h5>
                                                    </div>
                                                    <span className="text-secondary fw-bold">{apt.date}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <h6 className="fw-bold mb-1 text-dark">{apt.patientName}</h6>
                                                <span className="text-muted small"><i className="bi bi-telephone-fill me-1 opacity-50"></i>{apt.patientPhone}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill fw-bold border border-info border-opacity-25">
                                                    {apt.services}
                                                </span>
                                            </td>
                                            <td className="text-muted small" style={{ maxWidth: '200px' }}>{apt.note}</td>
                                            <td className="text-end px-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button onClick={() => handleApprove(apt.id)} className="btn btn-success rounded-pill px-3 shadow-sm fw-bold">
                                                        <i className="bi bi-check-lg"></i> Duyệt
                                                    </button>
                                                    <button onClick={() => openCancelModal(apt.id)} className="btn btn-outline-danger bg-white rounded-pill px-3 shadow-sm fw-bold">
                                                        <i className="bi bi-x-lg"></i> Từ chối
                                                    </button>
                                                </div>
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
                                    <option value={5}>5 lịch khám</option>
                                    <option value={10}>10 lịch khám</option>
                                    <option value={20}>20 lịch khám</option>
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

                {/* --- MODAL (POPUP) TỪ CHỐI / HỦY LỊCH --- */}
                {cancelModal.isOpen && <div className="modal-backdrop fade show" style={{ zIndex: 1040, backgroundColor: 'rgba(0,0,0,0.5)' }}></div>}
                {cancelModal.isOpen && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg fade-in-up">
                                <div className="modal-header border-0 pb-0 pt-4 px-4">
                                    <h5 className="modal-title fw-bolder text-danger d-flex align-items-center gap-2">
                                        <i className="bi bi-exclamation-octagon-fill"></i> Hủy / Từ chối lịch khám
                                    </h5>
                                    <button type="button" className="btn-close shadow-none" onClick={closeCancelModal}></button>
                                </div>
                                <div className="modal-body px-4 py-4">
                                    <label className="form-label fw-bold text-dark mb-2">Lý do từ chối <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control rounded-3 bg-light border-0 shadow-none p-3"
                                        rows="3"
                                        placeholder="Ví dụ: Bác sĩ kẹt lịch phẫu thuật đột xuất, vui lòng đổi ngày..."
                                        value={cancelModal.note}
                                        onChange={(e) => setCancelModal({ ...cancelModal, note: e.target.value })}
                                        autoFocus
                                    ></textarea>
                                </div>
                                <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex gap-2">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" onClick={closeCancelModal}>Quay lại</button>
                                    <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold flex-grow-1 shadow-sm" onClick={submitCancel} disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Xác nhận Hủy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorPending;