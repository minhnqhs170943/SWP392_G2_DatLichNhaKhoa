import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../services/authService';
import { forgotPasswordApi, resetPasswordApi } from '../../services/authService';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) return alert("Vui lòng nhập email!");

        setIsLoading(true);
        const data = await forgotPasswordApi(email);
        setIsLoading(false);

        if (data.success) {
            alert("Mã OTP đã được gửi đến email của bạn!");
            setStep(2);
        } else {
            alert(data.message || "Có lỗi xảy ra!");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return alert("Mật khẩu xác nhận không khớp!");
        }
        if (newPassword.length < 6) {
            return alert("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        setIsLoading(true);
        const data = await resetPasswordApi(email, otp, newPassword);
        setIsLoading(false);

        if (data.success) {
            alert("Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate('/login');
        } else {
            alert(data.message || "Mã OTP không hợp lệ!");
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

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Email của bạn</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="nguyenvana@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isLoading}>
                            {isLoading ? "Đang gửi email..." : "Nhận mã OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mã OTP (6 số)</label>
                            <input
                                type="text"
                                className="form-control text-center fs-4"
                                style={{ letterSpacing: '8px' }}
                                maxLength="6"
                                placeholder="------"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mật khẩu mới</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
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