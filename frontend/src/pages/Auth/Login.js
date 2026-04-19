import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '', general: '' });
    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = { email: '', password: '', general: '' };
        let isValid = true;

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // Regex: Email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex: Mật khẩu có ít nhất 1 chữ cái và 1 chữ số
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

        if (!trimmedEmail) {
            tempErrors.email = 'Email không được để trống';
            isValid = false;
        } else if (!emailRegex.test(trimmedEmail)) {
            tempErrors.email = 'Định dạng email không hợp lệ';
            isValid = false;
        }

        if (!trimmedPassword) {
            tempErrors.password = 'Mật khẩu không được để trống';
            isValid = false;
        } else if (trimmedPassword.length < 6 || trimmedPassword.length > 36) {
            tempErrors.password = 'Mật khẩu phải từ 6 đến 36 ký tự';
            isValid = false;
        } else if (!passRegex.test(trimmedPassword)) {
            tempErrors.password = 'Mật khẩu phải chứa cả chữ cái và chữ số';
            isValid = false;
        }

        setErrors(tempErrors);
        return { isValid, trimmedEmail, trimmedPassword };
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({ email: '', password: '', general: '' });

        const { isValid, trimmedEmail, trimmedPassword } = validate();
        if (!isValid) return;

        const data = await loginApi(trimmedEmail, trimmedPassword);
        try {
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                switch (data.user.RoleID) {
                    case 1: // Admin
                        alert("Chào Admin!");
                        navigate('/admin-analytics');
                        break;
                    case 2: // Staff
                        alert("Chào Bác sĩ!");
                        navigate('/doctor/dashboard');
                        break;
                    case 3: // Doctor
                        alert("Chào Nhân viên!");
                        navigate('/staff-dashboard');
                        break;
                    case 4: // Patient/User
                        alert("Đăng nhập thành công!");
                        navigate('/home');
                        break;
                    default:
                        navigate('/home');
                }
            } else {
                if (data.field) {
                    setErrors(prev => ({ ...prev, [data.field]: data.message }));
                } else {
                    setErrors(prev => ({ ...prev, general: data.message }));
                }
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, general: "Không thể kết nối đến máy chủ" }));
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={{ backgroundColor: '#e8f0fe' }}
        >

            <div
                className="bg-white rounded-4 p-4 p-md-5 shadow-sm"
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <div className="mb-4">
                    <Link to="/home" className="text-decoration-none text-muted">
                        ← Trang chủ
                    </Link>
                </div>
                <div className="text-center mb-4">
                    <h2 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>
                        Đăng nhập
                    </h2>
                    <p className="text-muted mb-0">Chào mừng bạn quay trở lại</p>
                </div>

                <form onSubmit={handleLogin}>
                    {errors.general && (
                        <div className="alert alert-danger py-2 px-3 small text-center mb-3">
                            {errors.general}
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label text-muted small">Email <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                        {errors.email && <small className="text-danger mt-1 d-block">{errors.email}</small>}
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-muted small">Mật khẩu <span className="text-danger">*</span></label>
                        <input
                            type="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                        {errors.password && <small className="text-danger mt-1 d-block">{errors.password}</small>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-lg w-100 text-white fw-semibold"
                        style={{
                            backgroundColor: '#4285f4',
                            borderRadius: '8px',
                            padding: '12px',
                            border: 'none',
                        }}
                    >
                        Đăng nhập
                    </button>
                </form>

                <div className="text-center mt-3">
                    <Link to="/forgot-password" className="text-decoration-none text-muted">
                        Quên mật khẩu?
                    </Link>
                </div>

                <div className="d-flex align-items-center my-4">
                    <hr className="flex-grow-1" style={{ borderColor: '#e0e0e0' }} />
                    <span className="px-3 text-muted small">Hoặc</span>
                    <hr className="flex-grow-1" style={{ borderColor: '#e0e0e0' }} />
                </div>

                <div className="text-center mt-4">
                    <span className="text-muted">Chưa có tài khoản? </span>
                    <Link
                        to="/register"
                        className="text-decoration-none fw-medium"
                        style={{ color: '#4285f4' }}
                    >
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;