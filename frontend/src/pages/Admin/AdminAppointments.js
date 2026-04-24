import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Dashboard/StaffAppointments.css'; // Reusing staff appointments CSS
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Modal state
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/appointments`);
            const data = await response.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu đặt lịch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const updateStatus = async (appointmentId, newStatus) => {
        if (!window.confirm(`Xác nhận chuyển trạng thái thành: ${newStatus}?`)) return;

        try {
            const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                fetchAppointments();
                if (selectedAppointment && selectedAppointment.AppointmentID === appointmentId) {
                    setSelectedAppointment({ ...selectedAppointment, Status: newStatus });
                }
            } else {
                alert('Có lỗi xảy ra khi cập nhật.');
            }
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            alert('Lỗi kết nối server!');
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'pending';
            case 'confirmed': return 'confirmed';
            case 'completed': return 'completed';
            case 'cancelled': return 'cancelled';
            default: return 'pending';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Pending': return 'Chờ xác nhận';
            case 'Confirmed': return 'Đã xác nhận';
            case 'Completed': return 'Hoàn thành';
            case 'Cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const openDetailsModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    };

    const filteredAppointments = appointments.filter(app => {
        const matchStatus = filterStatus === 'All' || app.Status === filterStatus;
        const matchSearch = app.PatientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.DoctorName && app.DoctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (app.ServiceNames && app.ServiceNames.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchStatus && matchSearch;
    });

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE) || 1;
    const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    };

    return (
        <div className="staff-appointments" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1e293b' }}>Lịch Sử Hẹn (Tổng Quan Admin)</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Chi tiết mọi lịch hẹn từ các nhân viên đặt lịch</p>
            </div>

            <div className="filters-wrapper">
                <div className="filter-group">
                    <label>Tìm Kiếm</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input
                            type="text"
                            placeholder="Tên bệnh nhân, bác sĩ, dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '38px' }}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <label>Trạng Thái</label>
                    <div style={{ position: 'relative' }}>
                        <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ paddingLeft: '38px' }}
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Pending">Chờ Xác Nhận</option>
                            <option value="Confirmed">Đã Xác Nhận (Confirmed)</option>
                            <option value="Completed">Hoàn Thành (Completed)</option>
                            <option value="Cancelled">Đã Hủy (Cancelled)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div className="p-5 text-center">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                ) : (
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Bệnh Nhân</th>
                                <th>Dịch Vụ & Bác Sĩ</th>
                                <th>Thời Gian Hẹn</th>
                                {/* <th>Tổng Tiền</th>
                                <th>Thanh Toán</th> */}
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAppointments.length > 0 ? (
                                paginatedAppointments.map(app => (
                                    <tr key={app.AppointmentID}>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar">
                                                    {app.PatientName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="patient-details">
                                                    <h4>{app.PatientName}</h4>
                                                    <p>{app.PatientPhone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold" style={{ color: '#1e293b' }}>{app.ServiceNames || 'Chưa có dịch vụ'}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>BS. {app.DoctorName || 'Chưa phân công'}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{new Date(app.AppointmentDate).toLocaleDateString('vi-VN')}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{app.AppointmentTime}</div>
                                        </td>
                                        {/* <td>
                                            <div className="fw-bold" style={{color: '#059669'}}>{formatCurrency(app.TotalPrice)}</div>
                                        </td>
                                        <td>
                                            {app.PaymentStatus === 'Completed' ? (
                                                <span className="status-badge completed">Đã TT</span>
                                            ) : (
                                                <span className="status-badge pending">Chưa TT</span>
                                            )}
                                        </td> */}
                                        <td>
                                            <span className={`status-badge ${getStatusClass(app.Status)}`}>
                                                {getStatusLabel(app.Status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-action btn-view" title="Xem chi tiết" onClick={() => openDetailsModal(app)}>
                                                    <Eye size={16} />
                                                </button>
                                                {app.Status === 'Confirmed' && (
                                                    <button className="btn-action btn-complete" onClick={() => updateStatus(app.AppointmentID, 'Completed')}>Xong</button>
                                                )}
                                                {(app.Status === 'Pending' || app.Status === 'Confirmed') && (
                                                    <button className="btn-action btn-cancel" onClick={() => updateStatus(app.AppointmentID, 'Cancelled')}>Hủy</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        Không tìm thấy lịch hẹn nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', gap: '5px' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '6px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                                padding: '6px 12px',
                                background: currentPage === page ? '#3b82f6' : '#fff',
                                color: currentPage === page ? '#fff' : '#0f172a',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '6px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* ===== Chi Tiết Modal ===== */}
            {isModalOpen && selectedAppointment && (
                <div className="appt-overlay" onClick={closeModal}>
                    <div className="appt-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="appt-dialog-head">
                            <h3>Chi Tiết Lịch Hẹn #{selectedAppointment.AppointmentID}</h3>
                            <button className="appt-close-btn" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="appt-dialog-body">
                            <div className="detail-row">
                                <div className="detail-label">Mã Lịch Hẹn</div>
                                <div className="detail-value" style={{ color: '#3b82f6' }}>#{selectedAppointment.AppointmentID}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Bệnh Nhân</div>
                                <div className="detail-value">
                                    {selectedAppointment.PatientName}
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '400' }}>SĐT: {selectedAppointment.PatientPhone || 'Chưa cung cấp'}</div>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Dịch Vụ</div>
                                <div className="detail-value">{selectedAppointment.ServiceNames || 'Chưa có dịch vụ'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Tổng Tiền</div>
                                <div className="detail-value" style={{ color: '#059669' }}>{formatCurrency(selectedAppointment.TotalPrice)}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Bác Sĩ</div>
                                <div className="detail-value">BS. {selectedAppointment.DoctorName || 'Chưa phân công'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Thời Gian Hẹn</div>
                                <div className="detail-value">
                                    {new Date(selectedAppointment.AppointmentDate).toLocaleDateString('vi-VN')} lúc {selectedAppointment.AppointmentTime}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Trạng Thái</div>
                                <div className="detail-value">
                                    <span className={`status-badge ${getStatusClass(selectedAppointment.Status)}`}>
                                        {getStatusLabel(selectedAppointment.Status)}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Thanh Toán</div>
                                <div className="detail-value">
                                    {selectedAppointment.PaymentStatus === 'Completed' ? (
                                        <span className="status-badge completed">Đã thanh toán ({selectedAppointment.PaymentMethod})</span>
                                    ) : (
                                        <span className="status-badge pending">Chưa thanh toán</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="appt-dialog-foot">
                            {selectedAppointment.Status === 'Confirmed' && (
                                <button className="btn-action btn-complete" onClick={() => updateStatus(selectedAppointment.AppointmentID, 'Completed')}>Hoàn Thành</button>
                            )}
                            {(selectedAppointment.Status === 'Pending' || selectedAppointment.Status === 'Confirmed') && (
                                <button className="btn-action btn-cancel" onClick={() => updateStatus(selectedAppointment.AppointmentID, 'Cancelled')}>Hủy Lịch</button>
                            )}
                            <button className="btn-action btn-view" onClick={closeModal}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAppointments;
