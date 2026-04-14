import { Link } from 'react-router-dom';
import './../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="custom-footer">
            <div className="container">
                <div className="row">
                    {/* Company Info */}
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">🦷</div>
                            <h3 className="footer-logo-text">SMILE SYNC</h3>
                        </div>
                        <p className="footer-description">
                            Hệ thống đặt lịch khám nha khoa trực tuyến.
                            Kết nối bạn với các phòng khám uy tín và đội ngũ bác sĩ chuyên nghiệp.
                        </p>
                        <div className="footer-social-icons">
                            <a href="#!" className="footer-social-icon">f</a>
                            <a href="#!" className="footer-social-icon">in</a>
                            <a href="#!" className="footer-social-icon">yt</a>
                            <a href="#!" className="footer-social-icon">ig</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h4 className="footer-heading">Liên kết</h4>
                        <ul className="footer-link-list">
                            <li className="footer-link-item">
                                <Link to="/" className="footer-link">Trang chủ</Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="/phong-kham" className="footer-link">Phòng khám</Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="/dich-vu" className="footer-link">Dịch vụ</Link>
                            </li>
                            <li className="footer-link-item">
                                <Link to="/gioi-thieu" className="footer-link">Giới thiệu</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h4 className="footer-heading">Dịch vụ</h4>
                        <ul className="footer-link-list">
                            <li className="footer-link-item">
                                <a href="#!" className="footer-link">Khám tổng quát</a>
                            </li>
                            <li className="footer-link-item">
                                <a href="#!" className="footer-link">Niềng răng</a>
                            </li>
                            <li className="footer-link-item">
                                <a href="#!" className="footer-link">Tẩy trắng răng</a>
                            </li>
                            <li className="footer-link-item">
                                <a href="#!" className="footer-link">Nhổ răng khôn</a>
                            </li>
                            <li className="footer-link-item">
                                <a href="#!" className="footer-link">Trồng răng Implant</a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h4 className="footer-heading">Liên hệ</h4>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">📍</span>
                            <span>Khu Công nghệ cao Hòa Lạc - Km29 Đại lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">📞</span>
                            <span>0834388989</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">✉️</span>
                            <span>smilesync@gmail.com</span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="footer-contact-icon">🕐</span>
                            <span>Thứ 2 - Chủ nhật: 8:00 - 20:00</span>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-divider">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <p className="footer-copyright">
                                © 2026 SMILE SYNC. Tất cả quyền được bảo lưu.
                            </p>
                        </div>
                        <div className="col-md-6">
                            <div className="footer-bottom-links justify-content-md-end justify-content-start mt-3 mt-md-0">
                                <a href="#!" className="footer-bottom-link">Điều khoản sử dụng</a>
                                <a href="#!" className="footer-bottom-link">Chính sách bảo mật</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;