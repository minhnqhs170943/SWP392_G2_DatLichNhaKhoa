import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchDoctors } from '../../services/doctorApi';
import { createAppointment } from '../../services/appointmentApi';
import './BookingPage.css';

const STEPS = [
    { num: 1, label: 'Chọn Dịch Vụ', icon: '🦷' },
    { num: 2, label: 'Chọn Bác Sĩ', icon: '👨‍⚕️' },
    { num: 3, label: 'Ngày & Giờ', icon: '📅' },
    { num: 4, label: 'Xác Nhận', icon: '✅' },
];

const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00'
];

const BookingPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [currentStep, setCurrentStep] = useState(1);
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);

    // Form state
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadData();
    }, []); // eslint-disable-line

    const loadData = async () => {
        try {
            setLoading(true);
            const [doctorsData, servicesRes] = await Promise.all([
                fetchDoctors(),
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/services`).then(r => r.json())
            ]);
            setDoctors(doctorsData || []);
            setServices(servicesRes.data || servicesRes.services || []);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (service) => {
        setSelectedServices(prev => {
            const exists = prev.find(s => s.ServiceID === service.ServiceID);
            if (exists) {
                return prev.filter(s => s.ServiceID !== service.ServiceID);
            }
            return [...prev, service];
        });
    };

    const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.Price || 0), 0);

    const canGoNext = () => {
        switch (currentStep) {
            case 1: return selectedServices.length > 0;
            case 2: return true; // Doctor is optional
            case 3: return selectedDate && selectedTime;
            case 4: return true;
            default: return false;
        }
    };

    const handleNext = () => {
        if (canGoNext() && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const data = {
                patientId: user.UserID,
                doctorId: selectedDoctor?.DoctorID || null,
                services: selectedServices.map(s => ({
                    serviceId: s.ServiceID,
                    price: s.Price
                })),
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                note: note || null
            };

            const result = await createAppointment(data);
            setBookingSuccess(result.data);
        } catch (error) {
            console.error('Lỗi đặt lịch:', error);
            alert('Đặt lịch thất bại: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="booking-page">
                    <div className="booking-loading">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Success screen
    if (bookingSuccess) {
        return (
            <>
                <Navbar />
                <div className="booking-page">
                    <div className="booking-success-card">
                        <div className="success-icon">🎉</div>
                        <h2>Đặt Lịch Thành Công!</h2>
                        <p className="success-subtitle">Lịch hẹn của bạn đã được tạo. Vui lòng thanh toán để xác nhận.</p>
                        
                        <div className="success-details">
                            <div className="success-row">
                                <span>Mã lịch hẹn</span>
                                <strong>#{bookingSuccess.appointmentId}</strong>
                            </div>
                            <div className="success-row">
                                <span>Tổng tiền</span>
                                <strong style={{color: '#059669'}}>{formatCurrency(bookingSuccess.totalAmount)}</strong>
                            </div>
                            <div className="success-row">
                                <span>Trạng thái</span>
                                <span className="badge-pending">Chờ thanh toán</span>
                            </div>
                        </div>

                        <div className="success-actions">
                            <button className="btn-primary-booking" onClick={() => navigate('/my-appointments')}>
                                📋 Xem Lịch Hẹn Của Tôi
                            </button>
                            <button className="btn-outline-booking" onClick={() => navigate('/home')}>
                                🏠 Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="booking-page">
                <div className="booking-container">
                    {/* Header */}
                    <div className="booking-header">
                        <h1>🦷 Đặt Lịch Khám</h1>
                        <p>Chọn dịch vụ, bác sĩ và thời gian phù hợp với bạn</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="steps-bar">
                        {STEPS.map((step) => (
                            <div
                                key={step.num}
                                className={`step-item ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                            >
                                <div className="step-circle">
                                    {currentStep > step.num ? '✓' : step.icon}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                        ))}
                        <div className="step-connector">
                            <div className="step-connector-fill" style={{width: `${((currentStep - 1) / 3) * 100}%`}}></div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="step-content">
                        {/* STEP 1: Chọn Dịch Vụ */}
                        {currentStep === 1 && (
                            <div className="step-panel">
                                <h2>Chọn Dịch Vụ Khám</h2>
                                <p className="step-desc">Bạn có thể chọn một hoặc nhiều dịch vụ</p>
                                <div className="services-grid">
                                    {services.map(svc => (
                                        <div
                                            key={svc.ServiceID}
                                            className={`service-card ${selectedServices.find(s => s.ServiceID === svc.ServiceID) ? 'selected' : ''}`}
                                            onClick={() => toggleService(svc)}
                                        >
                                            <div className="service-card-check">
                                                {selectedServices.find(s => s.ServiceID === svc.ServiceID) ? '✅' : '⬜'}
                                            </div>
                                            <h3>{svc.ServiceName}</h3>
                                            <p className="service-desc">{svc.Description || 'Dịch vụ chăm sóc răng miệng chuyên nghiệp'}</p>
                                            <div className="service-price">{formatCurrency(svc.Price)}</div>
                                        </div>
                                    ))}
                                </div>
                                {selectedServices.length > 0 && (
                                    <div className="selected-summary">
                                        <span>Đã chọn {selectedServices.length} dịch vụ</span>
                                        <span className="total-price">Tổng: {formatCurrency(totalPrice)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: Chọn Bác Sĩ */}
                        {currentStep === 2 && (
                            <div className="step-panel">
                                <h2>Chọn Bác Sĩ</h2>
                                <p className="step-desc">Chọn bác sĩ bạn muốn khám hoặc bỏ qua để hệ thống tự phân công</p>
                                <div className="doctors-grid">
                                    <div
                                        className={`doctor-card ${selectedDoctor === null ? 'selected' : ''}`}
                                        onClick={() => setSelectedDoctor(null)}
                                    >
                                        <div className="doctor-avatar">🏥</div>
                                        <h3>Để hệ thống chọn</h3>
                                        <p className="doctor-specialty">Bác sĩ sẽ được phân công tự động</p>
                                    </div>
                                    {doctors.map(doc => (
                                        <div
                                            key={doc.DoctorID}
                                            className={`doctor-card ${selectedDoctor?.DoctorID === doc.DoctorID ? 'selected' : ''}`}
                                            onClick={() => setSelectedDoctor(doc)}
                                        >
                                            <div className="doctor-avatar">
                                                {doc.AvatarURL ? (
                                                    <img src={doc.AvatarURL} alt={doc.FullName} />
                                                ) : (
                                                    doc.FullName?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <h3>BS. {doc.FullName}</h3>
                                            <p className="doctor-specialty">{doc.Specialty || 'Nha khoa tổng quát'}</p>
                                            {doc.ExperienceYears && (
                                                <span className="doctor-exp">{doc.ExperienceYears} năm kinh nghiệm</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Ngày & Giờ */}
                        {currentStep === 3 && (
                            <div className="step-panel">
                                <h2>Chọn Ngày & Giờ Khám</h2>
                                <p className="step-desc">Chọn thời gian phù hợp cho buổi khám</p>
                                
                                <div className="datetime-section">
                                    <div className="date-picker-wrapper">
                                        <label>📅 Ngày khám</label>
                                        <input
                                            type="date"
                                            className="date-input"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            min={getMinDate()}
                                        />
                                    </div>

                                    <div className="time-picker-wrapper">
                                        <label>⏰ Giờ khám</label>
                                        <div className="time-slots-grid">
                                            {TIME_SLOTS.map(time => (
                                                <button
                                                    key={time}
                                                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                    onClick={() => setSelectedTime(time)}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Xác Nhận */}
                        {currentStep === 4 && (
                            <div className="step-panel">
                                <h2>Xác Nhận Đặt Lịch</h2>
                                <p className="step-desc">Kiểm tra lại thông tin trước khi đặt lịch</p>
                                
                                <div className="confirm-card">
                                    <div className="confirm-section">
                                        <h4>👤 Thông tin bệnh nhân</h4>
                                        <div className="confirm-row">
                                            <span>Họ tên:</span>
                                            <strong>{user?.FullName}</strong>
                                        </div>
                                        <div className="confirm-row">
                                            <span>SĐT:</span>
                                            <strong>{user?.Phone || 'Chưa cung cấp'}</strong>
                                        </div>
                                    </div>

                                    <div className="confirm-section">
                                        <h4>🦷 Dịch vụ đã chọn</h4>
                                        {selectedServices.map(svc => (
                                            <div className="confirm-row" key={svc.ServiceID}>
                                                <span>{svc.ServiceName}</span>
                                                <strong>{formatCurrency(svc.Price)}</strong>
                                            </div>
                                        ))}
                                        <div className="confirm-row confirm-total">
                                            <span>Tổng cộng:</span>
                                            <strong>{formatCurrency(totalPrice)}</strong>
                                        </div>
                                    </div>

                                    <div className="confirm-section">
                                        <h4>👨‍⚕️ Bác sĩ</h4>
                                        <div className="confirm-row">
                                            <span>Bác sĩ phụ trách:</span>
                                            <strong>{selectedDoctor ? `BS. ${selectedDoctor.FullName}` : 'Hệ thống tự phân công'}</strong>
                                        </div>
                                    </div>

                                    <div className="confirm-section">
                                        <h4>📅 Thời gian khám</h4>
                                        <div className="confirm-row">
                                            <span>Ngày:</span>
                                            <strong>{new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                                        </div>
                                        <div className="confirm-row">
                                            <span>Giờ:</span>
                                            <strong>{selectedTime}</strong>
                                        </div>
                                    </div>

                                    <div className="confirm-section">
                                        <h4>📝 Ghi chú</h4>
                                        <textarea
                                            className="note-input"
                                            placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt (nếu có)..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="booking-nav">
                        {currentStep > 1 && (
                            <button className="btn-outline-booking" onClick={handleBack}>
                                ← Quay Lại
                            </button>
                        )}
                        <div className="nav-spacer"></div>
                        {currentStep < 4 ? (
                            <button
                                className="btn-primary-booking"
                                onClick={handleNext}
                                disabled={!canGoNext()}
                            >
                                Tiếp Tục →
                            </button>
                        ) : (
                            <button
                                className="btn-primary-booking btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? '⏳ Đang xử lý...' : '🦷 Xác Nhận Đặt Lịch'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BookingPage;
