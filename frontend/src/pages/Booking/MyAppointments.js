import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, X, XCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getMyAppointments, cancelAppointment, getAppointmentDetail } from '../../services/appointmentApi';
import './MyAppointments.css';

const MyAppointments = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Detail modal
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, []); // eslint-disable-line

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getMyAppointments(user.UserID);
            setAppointments(data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
        try {
            await cancelAppointment(appointmentId);
            alert('✅ Đã hủy lịch hẹn thành công.');
            fetchData();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleViewDetail = async (appointmentId) => {
        try {
            setDetailLoading(true);
            setShowModal(true);
            const data = await getAppointmentDetail(appointmentId);
            setSelectedDetail(data);
        } catch (error) {
            console.error('Lỗi lấy chi tiết:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDetail(null);
    };

    const filteredAppointments = appointments.filter(app => {
        return filterStatus === 'All' || app.Status === filterStatus;
    });

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
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

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) {
            const date = new Date(timeStr);
            if (!isNaN(date)) {
                const hours = String(date.getHours()).padStart(2, '0');
                const mins = String(date.getMinutes()).padStart(2, '0');
                return `${hours}:${mins}`;
            }
        }
        return timeStr.substring(0, 5);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    return (
        <>
            <Navbar />
            <div className="my-appointments-page">
                <div className="my-appt-container">
                    {/* Header */}
                    <div className="my-appt-header">
                        <div>
                            <h1>📋 Lịch Hẹn Của Tôi</h1>
                            <p>Xem và quản lý tất cả lịch hẹn khám</p>
                        </div>
                        <button className="btn-book-new" onClick={() => navigate('/booking')}>
                            + Đặt Lịch Mới
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="my-appt-filter">
                        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status === 'All' ? 'Tất cả' : getStatusLabel(status)}
                                {status !== 'All' && (
                                    <span className="filter-count">
                                        {appointments.filter(a => a.Status === status).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Appointments List */}
                    {loading ? (
                        <div className="my-appt-loading">
                            <div className="spinner"></div>
                            <p>Đang tải...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="my-appt-empty">
                            <div className="empty-icon">📭</div>
                            <h3>Chưa có lịch hẹn nào</h3>
                            <p>Đặt lịch khám ngay để chăm sóc sức khỏe răng miệng</p>
                            <button className="btn-book-new" onClick={() => navigate('/booking')}>
                                🦷 Đặt Lịch Ngay
                            </button>
                        </div>
                    ) : (
                        <div className="appointments-list">
                            {filteredAppointments.map(app => (
                                <div key={app.AppointmentID} className="appt-card">
                                    <div className="appt-card-top">
                                        <div className="appt-id">Lịch hẹn #{app.AppointmentID}</div>
                                        <span className={`appt-status ${getStatusClass(app.Status)}`}>
                                            {getStatusLabel(app.Status)}
                                        </span>
                                    </div>

                                    <div className="appt-card-body">
                                        <div className="appt-info-row">
                                            <div className="appt-info-item">
                                                <span className="info-label">📅 Ngày khám</span>
                                                <span className="info-value">{new Date(app.AppointmentDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                            <div className="appt-info-item">
                                                <span className="info-label">⏰ Giờ</span>
                                                <span className="info-value">{formatTime(app.AppointmentTime)}</span>
                                            </div>
                                            <div className="appt-info-item">
                                                <span className="info-label">👨‍⚕️ Bác sĩ</span>
                                                <span className="info-value">{app.DoctorName ? `BS. ${app.DoctorName}` : 'Chưa phân công'}</span>
                                            </div>
                                            <div className="appt-info-item">
                                                <span className="info-label">💰 Tổng tiền</span>
                                                <span className="info-value price">{formatCurrency(app.TotalPrice)}</span>
                                            </div>
                                        </div>
                                        <div className="appt-services-row">
                                            <span className="info-label">🦷 Dịch vụ:</span>
                                            <span className="info-value">{app.ServiceNames || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="appt-card-actions">
                                        <button className="btn-detail" onClick={() => handleViewDetail(app.AppointmentID)}>
                                            <Eye size={16} /> Chi Tiết
                                        </button>
                                        {app.Status === 'Pending' && (
                                            <button className="btn-cancel-appt" onClick={() => handleCancel(app.AppointmentID)}>
                                                <XCircle size={16} /> Hủy Lịch
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <h3>Chi Tiết Lịch Hẹn</h3>
                            <button className="modal-close" onClick={closeModal}><X size={22} /></button>
                        </div>
                        <div className="modal-body">
                            {detailLoading ? (
                                <div className="my-appt-loading"><div className="spinner"></div></div>
                            ) : selectedDetail ? (
                                <>
                                    <div className="modal-section">
                                        <h4>📋 Thông tin lịch hẹn</h4>
                                        <div className="modal-row">
                                            <span>Mã lịch hẹn</span>
                                            <strong style={{color: '#3b82f6'}}>#{selectedDetail.appointment.AppointmentID}</strong>
                                        </div>
                                        <div className="modal-row">
                                            <span>Ngày khám</span>
                                            <strong>{new Date(selectedDetail.appointment.AppointmentDate).toLocaleDateString('vi-VN')}</strong>
                                        </div>
                                        <div className="modal-row">
                                            <span>Giờ</span>
                                            <strong>{formatTime(selectedDetail.appointment.AppointmentTime)}</strong>
                                        </div>
                                        <div className="modal-row">
                                            <span>Bác sĩ</span>
                                            <strong>{selectedDetail.appointment.DoctorName ? `BS. ${selectedDetail.appointment.DoctorName}` : 'Chưa phân công'}</strong>
                                        </div>
                                        <div className="modal-row">
                                            <span>Trạng thái</span>
                                            <span className={`appt-status ${getStatusClass(selectedDetail.appointment.Status)}`}>
                                                {getStatusLabel(selectedDetail.appointment.Status)}
                                            </span>
                                        </div>
                                        {selectedDetail.appointment.Note && (
                                            <div className="modal-row" style={{flexDirection: 'column', gap: '6px'}}>
                                                <span>Ghi chú:</span>
                                                <div style={{background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', color: '#475569'}}>
                                                    {selectedDetail.appointment.Note}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-section">
                                        <h4>🦷 Dịch vụ đã chọn</h4>
                                        {selectedDetail.services.map((svc, i) => (
                                            <div className="modal-row" key={i}>
                                                <span>{svc.ServiceName}</span>
                                                <strong>{formatCurrency(svc.PriceAtBooking)}</strong>
                                            </div>
                                        ))}
                                        <div className="modal-row modal-total">
                                            <span>Tổng cộng</span>
                                            <strong>{formatCurrency(selectedDetail.services.reduce((s, sv) => s + parseFloat(sv.PriceAtBooking), 0))}</strong>
                                        </div>
                                    </div>

                                    {selectedDetail.invoice && (
                                        <div className="modal-section">
                                            <h4>💳 Thanh toán</h4>
                                            <div className="modal-row">
                                                <span>Hóa đơn</span>
                                                <strong>#{selectedDetail.invoice.InvoiceID}</strong>
                                            </div>
                                            <div className="modal-row">
                                                <span>Trạng thái</span>
                                                <span className={`appt-status ${selectedDetail.invoice.PaymentStatus === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                                                    {selectedDetail.invoice.PaymentStatus === 'Completed' ? 'Đã thanh toán' : selectedDetail.invoice.Status}
                                                </span>
                                            </div>
                                            {selectedDetail.invoice.PaymentMethod && (
                                                <div className="modal-row">
                                                    <span>Phương thức</span>
                                                    <strong>{selectedDetail.invoice.PaymentMethod}</strong>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p style={{color: '#94a3b8', textAlign: 'center'}}>Không tải được dữ liệu.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default MyAppointments;
