import { Link } from 'react-router-dom';
import './../styles/Navbar.css';

const Navbar = () => {
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
                        <Link to="/dich-vu" className="custom-nav-link">
                            Sản Phẩm
                        </Link>
                        <Link to="/gioi-thieu" className="custom-nav-link">
                            Giới thiệu
                        </Link>
                        <Link to="/lien-he" className="custom-nav-link">
                            Liên hệ
                        </Link>
                    </div>

                    <div className="d-none d-lg-flex align-items-center gap-2">
                        <Link to="/login" className="btn-login">Đăng nhập</Link>
                        <Link to="/register" className="btn-register">Đăng ký</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;