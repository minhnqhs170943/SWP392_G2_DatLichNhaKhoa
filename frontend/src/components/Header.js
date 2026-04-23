import { useNavigate } from 'react-router-dom';
import './../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="header-section">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-5 mb-lg-0">
                        <h1 className="header-title">
                            Keep your smile <span className="header-highlight">&amp; great</span>
                        </h1>
                        <p className="header-subtitle">
                            Đặt lịch khám nha khoa dễ dàng với các phòng khám uy tín hàng đầu.
                            Chăm sóc nụ cười của bạn ngay hôm nay.
                        </p>
                        <div className="d-flex flex-wrap gap-3">
                            <button className="btn-header-primary" onClick={() => navigate('/booking')}>
                                Đặt lịch khám
                            </button>
                            <button className="btn-header-outline" onClick={() => navigate('/about')}>
                                Về chúng tôi
                            </button>
                        </div>
                        <div className="contact-box flex-wrap">
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <span>📞</span>
                                </div>
                                <div>
                                    <p className="contact-label">Liên hệ</p>
                                    <p className="contact-value">0834388989</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <span>✉️</span>
                                </div>
                                <div>
                                    <p className="contact-label">Email</p>
                                    <p className="contact-value">smilesync@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="header-image-container text-center">
                            <img
                                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&h=400&fit=crop"
                                alt="Nha khoa"
                                className="header-hero-image"
                            />
                            <div className="header-floating-icon icon-1">✨</div>
                            <div className="header-floating-icon icon-2">🦷</div>
                            <div className="header-floating-icon icon-3">💙</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;