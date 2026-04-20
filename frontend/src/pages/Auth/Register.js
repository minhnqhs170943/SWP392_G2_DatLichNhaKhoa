import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../services/authService'; // Import service gọi API

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [generalMsg, setGeneralMsg] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;

        // Trim dữ liệu
        const trimmedData = {
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            password: formData.password.trim(),
            confirmPassword: formData.confirmPassword.trim()
        };

        // Validate Họ và tên
        const nameRegex = /^[\p{L}\s]+$/u;
        if (!trimmedData.fullName) {
            tempErrors.fullName = 'Họ và tên không được để trống';
            isValid = false;
        } else if (trimmedData.fullName.length > 255) {
            tempErrors.fullName = 'Họ và tên không vượt quá 255 ký tự';
            isValid = false;
        } else if (!nameRegex.test(trimmedData.fullName)) {
            tempErrors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt';
            isValid = false;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedData.email) {
            tempErrors.email = 'Email không được để trống';
            isValid = false;
        } else if (!emailRegex.test(trimmedData.email)) {
            tempErrors.email = 'Định dạng email không hợp lệ';
            isValid = false;
        }

        // Validate Số điện thoại
        const phoneRegex = /^0\d{9}$/;
        if (!trimmedData.phone) {
            tempErrors.phone = 'Số điện thoại không được để trống';
            isValid = false;
        } else if (!phoneRegex.test(trimmedData.phone)) {
            tempErrors.phone = 'Số điện thoại phải bắt đầu bằng 0, gồm đúng 10 chữ số, không chứa chữ hay ký tự đặc biệt';
            isValid = false;
        }

        // Validate Địa chỉ
        if (!trimmedData.address) {
            tempErrors.address = 'Địa chỉ không được để trống';
            isValid = false;
        } else if (trimmedData.address.length > 255) {
            tempErrors.address = 'Địa chỉ không vượt quá 255 ký tự';
            isValid = false;
        }

        // Validate Password
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        if (!trimmedData.password) {
            tempErrors.password = 'Mật khẩu không được để trống';
            isValid = false;
        } else if (trimmedData.password.length < 6 || trimmedData.password.length > 36) {
            tempErrors.password = 'Mật khẩu phải từ 6 đến 36 ký tự';
            isValid = false;
        } else if (!passRegex.test(trimmedData.password)) {
            tempErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số';
            isValid = false;
        }

        // Validate Confirm Password
        if (!trimmedData.confirmPassword) {
            tempErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            isValid = false;
        } else if (trimmedData.password !== trimmedData.confirmPassword) {
            tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }

        setErrors(tempErrors);
        return { isValid, trimmedData };
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralMsg({ type: '', text: '' });

        const { isValid, trimmedData } = validate();
        if (!isValid) return;

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const data = await registerApi(trimmedData);

            if (data && data.success) {
                setGeneralMsg({ type: 'success', text: 'Đăng ký thành công!' });
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                if (data.field) {
                    setErrors(prev => ({ ...prev, [data.field]: data.message }));
                } else {
                    setGeneralMsg({ type: 'error', text: data?.message || "Đăng ký thất bại!" });
                }
            }
        } catch (error) {
            setGeneralMsg({ type: 'error', text: "Lỗi kết nối! Vui lòng thử lại." });
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ backgroundColor: '#e3f2fd' }}>
            <div className="card shadow-lg border-0" style={{ width: '500px', borderRadius: '15px' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-primary">Đăng Ký Tài Khoản</h2>
                        <p className="text-muted">Tạo Tài Khoản Mới</p>
                    </div>

                    <form onSubmit={handleRegister}>
                        {generalMsg.text && (
                            <div className={`alert py-2 px-3 small text-center mb-3 ${generalMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                {generalMsg.text}
                            </div>
                        )}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Họ và tên <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="fullName"
                                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                placeholder="Nguyễn Văn A"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            {errors.fullName && <small className="text-danger mt-1 d-block">{errors.fullName}</small>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                name="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <small className="text-danger mt-1 d-block">{errors.email}</small>}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Số điện thoại <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="phone"
                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                    placeholder="090xxxxxxx"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && <small className="text-danger mt-1 d-block">{errors.phone}</small>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Địa chỉ <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="address"
                                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                    placeholder="Hà Nội..."
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                                {errors.address && <small className="text-danger mt-1 d-block">{errors.address}</small>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Mật khẩu <span className="text-danger">*</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && <small className="text-danger mt-1 d-block">{errors.password}</small>}
                            </div>
                            <div className="col-md-6 mb-4">
                                <label className="form-label fw-semibold">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                {errors.confirmPassword && <small className="text-danger mt-1 d-block">{errors.confirmPassword}</small>}
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