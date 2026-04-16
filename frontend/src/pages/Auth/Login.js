import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../../services/authService';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const data = await loginApi(email, password);

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.RoleID === 1) {
                alert("Đăng nhập với tư cách admin thành công");
                navigate('/admin-analytics');
            } else if (data.user.RoleID === 2) {
                alert("Đăng nhập với tư cách nhân viên thành công");
                navigate('/staff-dashboard');
            } else {
                alert("Đăng nhập thành công!");
                navigate('/home');
            }
        } else {
            alert(data.message);
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
                    <div className="mb-3">
                        <label className="form-label text-muted small">Email</label>
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                padding: '12px 16px',
                            }}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-muted small">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-control form-control-lg"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                padding: '12px 16px',
                            }}
                        />
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