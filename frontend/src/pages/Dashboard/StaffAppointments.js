import React, { useState, useEffect } from 'react';
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
        if (!window.confirm(`Xác nhận chuyển trạng thái thành: ${newStatus}?`)) return;

        try {
            const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            if (data.success) {
                // Update local state and selected appointment if modal is open
                fetchAppointments();
                if (selectedAppointment && selectedAppointment.AppointmentID === appointmentId) {
                    setSelectedAppointment({...selectedAppointment, Status: newStatus});
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

    const openDetailsModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAppointment(null), 300); // delay to let animation finish
    };

    const filteredAppointments = appointments.filter(app => {
        const matchStatus = filterStatus === 'All' || app.Status === filterStatus;
        const matchSearch = app.PatientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (app.DoctorName && app.DoctorName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchStatus && matchSearch;
    });

    return (
        <div className="staff-appointments">
            <div className="page-header">
                <h2>Quản Lý Đặt Lịch</h2>
                <p>Xem và duyệt yêu cầu xếp lịch từ bệnh nhân</p>
            </div>

            <div className="filters-wrapper">
                <div className="filter-group">
                    <label>Tìm Kiếm</label>
                    <div style={{position: 'relative'}}>
                        <Search size={18} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}} />
                        <input 
                            type="text" 
                            placeholder="Tên bệnh nhân, tên bác sĩ..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{paddingLeft: '38px'}}
                        />
                    </div>
                </div>
                <div className="filter-group">
                    <label>Trạng Thái</label>
                    <div style={{position: 'relative'}}>
                        <Filter size={18} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}} />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{paddingLeft: '38px'}}
                        >
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Pending">Chờ Duyệt (Pending)</option>
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
                                            <div className="fw-bold" style={{color: '#1e293b'}}>{app.ServiceName || 'Khám Tổng Quát'}</div>
                                            <div style={{color: '#64748b', fontSize: '0.85rem'}}>BS. {app.DoctorName || 'Chưa phân công'}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{new Date(app.AppointmentDate).toLocaleDateString('vi-VN')}</div>
                                            <div style={{color: '#64748b', fontSize: '0.85rem'}}>{app.AppointmentTime}</div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(app.Status)}`}>
                                                {app.Status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-action btn-view" title="Xem chi tiết" onClick={() => openDetailsModal(app)}>
                                                    <Eye size={16} /> Chi tiết
                                                </button>
                                                {app.Status === 'Pending' && (
                                                    <button className="btn-action btn-approve" onClick={() => updateStatus(app.AppointmentID, 'Confirmed')}>Duyệt</button>
                                                )}
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
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        Không tìm thấy lịch hẹn nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Appointment Details Modal */}
            {isModalOpen && selectedAppointment && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi Tiết Lịch Hẹn #{selectedAppointment.AppointmentID}</h3>
                            <button className="btn-close" onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <div className="detail-label">Mã Lịch Hẹn</div>
                                <div className="detail-value text-primary">#{selectedAppointment.AppointmentID}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Bệnh Nhân</div>
                                <div className="detail-value">
                                    {selectedAppointment.PatientName}
                                    <div style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '400'}}>SĐT: {selectedAppointment.PatientPhone || 'Chưa cung cấp'}</div>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Điều Trị / Dịch Vụ</div>
                                <div className="detail-value">{selectedAppointment.ServiceName || 'Khám Tổng Quát'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Bác Sĩ Phụ Trách</div>
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
                                    <span style={{padding: '4px 10px'}} className={`status-badge ${getStatusClass(selectedAppointment.Status)}`}>
                                        {selectedAppointment.Status}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-row" style={{flexDirection: 'column', paddingBottom: '0'}}>
                                <div className="detail-label" style={{width: '100%', marginBottom: '8px'}}>Ghi Chú Yêu Cầu:</div>
                                <div className="detail-value" style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', fontWeight: 'normal', fontSize: '0.9rem', color: '#334155'}}>
                                    {selectedAppointment.Note ? selectedAppointment.Note : <span className="text-muted fst-italic">Không có ghi chú nào.</span>}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {selectedAppointment.Status === 'Pending' && (
                                <button className="btn-action btn-approve" onClick={() => { updateStatus(selectedAppointment.AppointmentID, 'Confirmed'); }}>Xác Nhận (Duyệt)</button>
                            )}
                            {selectedAppointment.Status === 'Confirmed' && (
                                <button className="btn-action btn-complete" onClick={() => { updateStatus(selectedAppointment.AppointmentID, 'Completed'); }}>Hoàn Thành</button>
                            )}
                            {(selectedAppointment.Status === 'Pending' || selectedAppointment.Status === 'Confirmed') && (
                                <button className="btn-action btn-cancel" onClick={() => { updateStatus(selectedAppointment.AppointmentID, 'Cancelled'); }}>Hủy Lịch</button>
                            )}
                            <button className="btn-action btn-view" onClick={closeModal} style={{borderColor: '#cbd5e1', color: '#475569'}}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAppointments;
