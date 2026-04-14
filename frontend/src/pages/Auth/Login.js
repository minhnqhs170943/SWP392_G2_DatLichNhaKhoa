import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Đăng nhập với:", { email, password });
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e3f2fd' }}>
            <div className="card shadow-lg border-0" style={{ width: '400px', borderRadius: '15px' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">🦷 Nha Khoa G2</h2>
                        <p className="text-muted">Đặt lịch khám nhanh chóng</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3 text-start">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4 text-start">
                            <label className="form-label fw-semibold">Mật khẩu</label>
                            <input
                                type="password"
                                className="form-control form-control-lg"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm mb-3">
                            Đăng nhập
                        </button>
                    </form>

                    <div className="text-center mt-2">
                        <span className="small text-muted">Chưa có tài khoản? </span>
                        <Link to="/register" className="small text-decoration-none fw-bold">Đăng ký ngay</Link>
                    </div>
                    <div className="mt-4 text-center border-top pt-3">
                        <small className="text-muted d-block mb-2">Truy cập nhanh (Dành cho Ban Giám Đốc):</small>
                        <button 
                            className="btn btn-outline-dark btn-sm rounded-pill px-4 mb-2"
                            onClick={() => window.location.href = '/admin-analytics'}
                        >
                            Vào Admin Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;