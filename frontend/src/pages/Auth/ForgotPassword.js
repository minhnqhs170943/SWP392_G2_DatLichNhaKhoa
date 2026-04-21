import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi, resetPasswordApi } from '../../services/authService';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const validateStep1 = () => {
        let tempErrors = {};
        let isValid = true;
        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!trimmedEmail) {
            tempErrors.email = 'Email không được để trống';
            isValid = false;
        } else if (!emailRegex.test(trimmedEmail)) {
            tempErrors.email = 'Định dạng email không hợp lệ';
            isValid = false;
        }

        setErrors(tempErrors);
        return { isValid, trimmedEmail };
    };

    const validateStep2 = () => {
        let tempErrors = {};
        let isValid = true;
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        const trimmedOTP = otp.trim();
        const trimmedNewPassword = newPassword.trim();
        const trimmedConfirm = confirmPassword.trim();

        if (!trimmedOTP) {
            tempErrors.otp = "Vui lòng nhập mã OTP";
            isValid = false;
        }

        if (!trimmedNewPassword) {
            tempErrors.newPassword = "Mật khẩu không được để trống";
            isValid = false;
        } else if (trimmedNewPassword.length < 6 || trimmedNewPassword.length > 36) {
            tempErrors.newPassword = "Mật khẩu phải từ 6 đến 36 ký tự";
            isValid = false;
        } else if (!passRegex.test(trimmedNewPassword)) {
            tempErrors.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số";
            isValid = false;
        }

        if (!trimmedConfirm) {
            tempErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
            isValid = false;
        } else if (trimmedNewPassword !== trimmedConfirm) {
            tempErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
            isValid = false;
        }

        setErrors(tempErrors);
        return { isValid, trimmedOTP, trimmedNewPassword, trimmedConfirm };
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');
        
        const { isValid, trimmedEmail } = validateStep1();
        if (!isValid) return;

        setEmail(trimmedEmail);
        setIsLoading(true);
        
        try {
            const data = await forgotPasswordApi(trimmedEmail);
            if (data.success) {
                setSuccessMessage("Mã OTP đã được gửi đến email của bạn!");
                setStep(2);
            } else {
                if (data.field) {
                    setErrors({ [data.field]: data.message });
                } else {
                    setErrors({ general: data.message || "Có lỗi xảy ra!" });
                }
            }
        } catch (error) {
            setErrors({ general: "Lỗi kết nối máy chủ!" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        const { isValid, trimmedOTP, trimmedNewPassword, trimmedConfirm } = validateStep2();
        if (!isValid) return;

        setOtp(trimmedOTP);
        setNewPassword(trimmedNewPassword);
        setConfirmPassword(trimmedConfirm);

        setIsLoading(true);
        try {
            const data = await resetPasswordApi(email, trimmedOTP, trimmedNewPassword);
            if (data.success) {
                setSuccessMessage("Khôi phục mật khẩu thành công!");
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                if (data.field) {
                    setErrors({ [data.field]: data.message });
                } else {
                    setErrors({ general: data.message || "Mã OTP không hợp lệ!" });
                }
            }
        } catch (error) {
            setErrors({ general: "Lỗi kết nối máy chủ!" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="card shadow border-0 p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '15px' }}>
                <div className="text-center mb-4">
                    <h2 className="fw-bold" style={{ color: '#1a237e' }}>Quên Mật Khẩu</h2>
                    <p className="text-muted">
                        {step === 1 ? "Nhập email đã đăng ký để nhận mã khôi phục" : "Nhập mã OTP và mật khẩu mới của bạn"}
                    </p>
                </div>

                {errors.general && (
                    <div className="alert alert-danger py-2 px-3 small text-center mb-3">
                        {errors.general}
                    </div>
                )}
                {successMessage && (
                    <div className="alert alert-success py-2 px-3 small text-center mb-3">
                        {successMessage}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Email của bạn <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                placeholder="nguyenvana@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <small className="text-danger mt-1 d-block">{errors.email}</small>}
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isLoading}>
                            {isLoading ? "Đang gửi email..." : "Nhận mã OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mã OTP (6 số) <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className={`form-control text-center fs-4 ${errors.otp ? 'is-invalid' : ''}`}
                                style={{ letterSpacing: '8px' }}
                                maxLength="6"
                                placeholder="------"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            />
                            {errors.otp && <small className="text-danger mt-1 d-block text-start" style={{ letterSpacing: 'normal' }}>{errors.otp}</small>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mật khẩu mới <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {errors.newPassword && <small className="text-danger mt-1 d-block">{errors.newPassword}</small>}
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmPassword && <small className="text-danger mt-1 d-block">{errors.confirmPassword}</small>}
                        </div>
                        <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                        </button>
                    </form>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-decoration-none" style={{ color: '#2563eb' }}>
                        &larr; Quay lại trang đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;