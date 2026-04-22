import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SidebarStaff/Sidebar';
import { Search, Filter, Eye, X } from 'lucide-react';
import './StaffAppointments.css';

const StaffAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
    };

    // Confirm modal state
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [confirmLoading, setConfirmLoading] = useState(false);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/appointments');
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
        try {
            const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}/status`, {
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
                const label = newStatus === 'Completed' ? 'Hoàn thành' : newStatus === 'Cancelled' ? 'Hủy' : newStatus;
                showToast(`✅ Đã chuyển trạng thái thành: ${label}`);
            } else {
                showToast('Có lỗi xảy ra khi cập nhật.', 'error');
            }
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            showToast('Lỗi kết nối server!', 'error');
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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const datePart = dateStr.split('T')[0];
        const [y, m, d] = datePart.split('-');
        if (y && m && d) return `${d}/${m}/${y}`;
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) {
            return timeStr.split('T')[1].substring(0, 5);
        }
        return timeStr.substring(0, 5);
    };

    // Xác nhận lịch hẹn
    const handleConfirmAppointment = async (appointment) => {
        if (appointment.DoctorID) {
            // Customer đã chọn bác sĩ → xác nhận trực tiếp
            setConfirmLoading(true);
            try {
                const response = await fetch(`http://localhost:5001/api/appointments/${appointment.AppointmentID}/confirm`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const data = await response.json();
                if (data.success) {
                    showToast(`✅ Xác nhận lịch hẹn của ${appointment.PatientName} thành công!`);
                    fetchAppointments();
                } else {
                    showToast('Lỗi: ' + data.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi xác nhận:', error);
                showToast('Không thể kết nối đến server!', 'error');
            } finally {
                setConfirmLoading(false);
            }
            return;
        }

        // Customer chưa chọn bác sĩ → mở modal để staff chọn hoặc auto-assign
        setConfirmTarget(appointment);
        setSelectedDoctorId('');
        setIsConfirmModalOpen(true);
        setConfirmLoading(true);
        try {
            const d = new Date(appointment.AppointmentDate);
            const dateStr = d.toISOString().split('T')[0];
            const timeStr = appointment.AppointmentTime;

            const response = await fetch(`http://localhost:5001/api/doctors/available?date=${dateStr}&time=${timeStr}`);
            const data = await response.json();
            if (data.success) {
                setAvailableDoctors(data.data || []);
            }
        } catch (error) {
            console.error('Lỗi tải bác sĩ rảnh:', error);
        } finally {
            setConfirmLoading(false);
        }
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setConfirmTarget(null);
        setAvailableDoctors([]);
        setSelectedDoctorId('');
    };

    // Staff chọn bác sĩ cụ thể rồi xác nhận
    const handleConfirmWithDoctor = async () => {
        if (!selectedDoctorId) {
            showToast('Vui lòng chọn bác sĩ!', 'error');
            return;
        }
        setConfirmLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/appointments/${confirmTarget.AppointmentID}/confirm`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: selectedDoctorId })
            });
            const data = await response.json();
            if (data.success) {
                closeConfirmModal();
                showToast(`✅ Xác nhận thành công! Đã phân công BS. ${data.data.doctorName}`);
                fetchAppointments();
            } else {
                showToast('Lỗi: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Lỗi xác nhận:', error);
            showToast('Không thể kết nối đến server!', 'error');
        } finally {
            setConfirmLoading(false);
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div className="staff-appointments" style={{ flex: 1, marginLeft: '260px', width: 'calc(100% - 260px)' }}>
                <div className="page-header" style={{ marginBottom: '24px' }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1e293b' }}>Quản Lý Đặt Lịch</h2>
                    <p style={{ margin: 0, color: '#64748b' }}>Xem, thanh toán và quản lý lịch hẹn — Thanh toán xong tự động xác nhận</p>
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
                                <option value="Pending">Chờ Xác Nhận (Pending)</option>
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
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments.map(app => (
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
                                                <div className="fw-bold">{formatDate(app.AppointmentDate)}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{formatTime(app.AppointmentTime)}</div>
                                            </td>
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
                                                    {app.Status === 'Pending' && (
                                                        <button className="btn-action btn-complete" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => handleConfirmAppointment(app)}>Xác nhận</button>
                                                    )}
                                                    {app.Status === 'Confirmed' && (
                                                        <button className="btn-action btn-complete" onClick={() => updateStatus(app.AppointmentID, 'Completed')}>Hoàn thành</button>
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
                                        {formatDate(selectedAppointment.AppointmentDate)} lúc {formatTime(selectedAppointment.AppointmentTime)}
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
                                <div className="detail-row" style={{ flexDirection: 'column', paddingBottom: '0' }}>
                                    <div className="detail-label" style={{ width: '100%', marginBottom: '8px' }}>Ghi Chú Yêu Cầu:</div>
                                    <div className="detail-value" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontWeight: 'normal', fontSize: '0.9rem', color: '#334155' }}>
                                        {selectedAppointment.Note ? selectedAppointment.Note : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có ghi chú nào.</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="appt-dialog-foot">
                                {selectedAppointment.Status === 'Pending' && (
                                    <button className="btn-action btn-complete" style={{ background: '#3b82f6', color: '#fff' }} onClick={() => { closeModal(); setTimeout(() => handleConfirmAppointment(selectedAppointment), 100); }}>Xác Nhận</button>
                                )}
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



                {/* ===== Xác Nhận & Phân Công Modal ===== */}
                {isConfirmModalOpen && confirmTarget && (
                    <div className="appt-overlay" onClick={closeConfirmModal}>
                        <div className="appt-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="appt-dialog-head" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '16px 16px 0 0' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>✅ Xác Nhận Lịch Hẹn</h3>
                                <button className="appt-close-btn" onClick={closeConfirmModal} style={{ color: '#fff' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="appt-dialog-body">
                                <div className="detail-row">
                                    <div className="detail-label">Bệnh Nhân</div>
                                    <div className="detail-value">{confirmTarget.PatientName}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Thời Gian</div>
                                    <div className="detail-value">{formatTime(confirmTarget.AppointmentTime)} — {formatDate(confirmTarget.AppointmentDate)}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Dịch Vụ</div>
                                    <div className="detail-value">{confirmTarget.ServiceNames || 'Chưa có'}</div>
                                </div>

                                <div style={{ marginTop: '16px', padding: '12px', background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '8px', fontSize: '0.9rem', color: '#92400e' }}>
                                    ⚠️ Khách hàng chưa chọn bác sĩ. Vui lòng chọn bác sĩ hoặc để hệ thống tự phân công.
                                </div>

                                <h4 style={{ margin: '16px 0 10px', fontSize: '1rem', color: '#1e293b' }}>Chọn bác sĩ:</h4>
                                {confirmLoading ? (
                                    <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tìm bác sĩ rảnh...</p>
                                ) : availableDoctors.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                                        {availableDoctors.map(doc => {
                                            const isBusy = !doc.IsAvailable;
                                            return (
                                                <div
                                                    key={doc.DoctorID}
                                                    onClick={() => !isBusy && setSelectedDoctorId(doc.DoctorID)}
                                                    style={{
                                                        padding: '12px',
                                                        border: selectedDoctorId === doc.DoctorID ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        cursor: isBusy ? 'not-allowed' : 'pointer',
                                                        background: selectedDoctorId === doc.DoctorID ? '#eff6ff' : isBusy ? '#f8fafc' : '#fff',
                                                        opacity: isBusy ? 0.6 : 1,
                                                        filter: isBusy ? 'grayscale(0.5)' : 'none',
                                                        transition: 'all 0.15s ease',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>
                                                        BS. {doc.FullName}
                                                        {isBusy && <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: '#ef4444', border: '1px solid #ef4444', padding: '1px 4px', borderRadius: '4px' }}>ĐÃ BẬN</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{doc.Specialty || 'Nha khoa tổng quát'}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#ef4444' }}>
                                        Không có bác sĩ nào rảnh trong khung giờ này.
                                    </div>
                                )}
                            </div>
                            <div className="appt-dialog-foot" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                <button
                                    className="btn-action btn-complete"
                                    onClick={handleConfirmWithDoctor}
                                    disabled={!selectedDoctorId || confirmLoading}
                                >
                                    Xác Nhận & Phân Công
                                </button>

                                <button className="btn-action btn-view" onClick={closeConfirmModal}>Hủy Bỏ</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Toast Notification ===== */}
            {toast.visible && (
                <div className={`staff-toast ${toast.type}`} onClick={() => setToast(prev => ({ ...prev, visible: false }))}>
                    <span>{toast.message}</span>
                    <button className="toast-close" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>✕</button>
                </div>
            )}
        </div>
    );
};

export default StaffAppointments;
