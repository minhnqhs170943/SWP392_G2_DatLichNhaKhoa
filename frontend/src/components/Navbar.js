import { Link, useNavigate } from 'react-router-dom';
import './../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user')
        alert("Đã đăng xuất");
        navigate('/home');
    };
    return (
        <nav className="custom-navbar">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    <Link to="/home" className="brand-link">
                        <div className="brand-logo">
                            <span>🦷</span>
                        </div>
                        <Link to="/home" className="brand-name">
                            SMILE SYNC
                        </Link>
                    </Link>

                    <div className="d-none d-lg-flex align-items-center gap-4">
                        <Link to="/home" className="custom-nav-link">
                            Trang chủ
                        </Link>
                        <Link to="/phong-kham" className="custom-nav-link">
                            Đặt Lịch
                        </Link>
                        <Link to="/product" className="custom-nav-link">
                            Sản Phẩm
                        </Link>
                        <Link to="/gioi-thieu" className="custom-nav-link">
                            Giới thiệu
                        </Link>
                        <Link to="/lien-he" className="custom-nav-link">
                            Liên hệ
                        </Link>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {user ? (
                            <>
                                <span className="text-primary fw-bold">Chào, {user.FullName}</span>
                                {user.RoleID === 1 && <Link to="/admin" className="btn-admin">Quản lý</Link>}
                                <button onClick={handleLogout} className="btn-login">Đăng xuất</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-login">Đăng nhập</Link>
                                <Link to="/register" className="btn-register">Đăng ký</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;