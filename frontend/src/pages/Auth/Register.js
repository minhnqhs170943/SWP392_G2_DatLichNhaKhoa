import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        console.log("Dữ liệu đăng ký:", formData);
        // Sau này sẽ gọi API POST /register ở đây
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#e3f2fd' }}>
            <div className="card shadow-lg border-0" style={{ width: '450px', borderRadius: '15px' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">Đăng Ký Tài Khoản</h2>
                        <p className="text-muted">Gia nhập gia đình Nha Khoa G2</p>
                    </div>

                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Họ và tên</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-control"
                                placeholder="Nguyễn Văn A"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="name@example.com"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-control"
                                placeholder="090xxxxxxx"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Mật khẩu</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-6 mb-4">
                                <label className="form-label fw-semibold">Xác nhận</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm mb-3">
                            Đăng ký ngay
                        </button>
                    </form>

                    <div className="text-center">
                        <span className="small text-muted">Đã có tài khoản? </span>
                        <Link to="/login" className="small text-decoration-none fw-bold">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;