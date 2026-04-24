import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/DoctorDashboard.css';

const DoctorSidebar = () => {
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : {};

    const doctor = {
        fullName: currentUser.FullName || currentUser.fullName || "Bác sĩ", 
        specialty: currentUser.Specialty || currentUser.specialty || "Chuyên khoa Răng Hàm Mặt",
        avatarUrl: currentUser.Avatar || currentUser.avatar || ""
    };

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?")) {
            localStorage.removeItem('user');
            localStorage.removeItem('token'); 
            
            window.dispatchEvent(new Event('authChange')); 
            
            navigate('/login');
        }
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white glass-sidebar" 
             style={{ width: '280px', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
            
            <Link to="/doctor/dashboard" className="d-flex align-items-center mb-4 mt-3 mx-auto text-decoration-none">
                <div className="rounded-circle d-flex justify-content-center align-items-center me-3 shadow-lg" 
                     style={{width: '45px', height: '45px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}>
                    <i className="bi bi-heart-pulse-fill fs-4 text-white"></i>
                </div>
                <span className="fs-3 fw-bolder brand-glow tracking-tight">SMILE SYNC</span>
            </Link>
            
            <hr className="border-white opacity-10 mx-3 mb-4" />

            <ul className="nav nav-pills flex-column mb-auto gap-3 px-2">
                <li>
                    <Link to="/doctor/dashboard" className={`nav-link d-flex align-items-center gap-3 px-4 py-3 rounded-4 text-white nav-item-glass ${path === '/doctor/dashboard' ? 'active' : ''}`}>
                        <i className="bi bi-grid-1x2-fill fs-5 nav-icon"></i>
                        <span className="fw-semibold">Tổng quan</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/pending" className={`nav-link d-flex align-items-center gap-3 px-4 py-3 rounded-4 text-white nav-item-glass ${path === '/doctor/pending' ? 'active' : ''}`}>
                        <i className="bi bi-hourglass-split fs-5 nav-icon"></i>
                        <span className="fw-semibold">Lịch chờ duyệt</span>
                    </Link>
                </li>
                <li>
                    {/* [GIẢI THÍCH SỬA]: Dùng path.startsWith thay vì includes để path matching chính xác hơn, tránh lỗi trùng lặp khi có route khác cũng chứa chữ consultation */}
                    <Link to="/doctor/consultation" className={`nav-link d-flex align-items-center gap-3 px-4 py-3 rounded-4 text-white nav-item-glass ${path.startsWith('/doctor/consultation') ? 'active' : ''}`}>
                        <i className="bi bi-clipboard2-pulse fs-5 nav-icon"></i>
                        <span className="fw-semibold">Khám & Kê đơn</span>
                    </Link>
                </li>
                <li>
                    <Link to="/doctor/history" className={`nav-link d-flex align-items-center gap-3 px-4 py-3 rounded-4 text-white nav-item-glass ${path === '/doctor/history' ? 'active' : ''}`}>
                        <i className="bi bi-clock-history fs-5 nav-icon"></i>
                        <span className="fw-semibold">Lịch sử khám</span>
                    </Link>
                </li>
            </ul>

\            <div className="mt-auto px-2 pb-3 pt-4 position-relative">
                <div 
                    className="rounded-4 p-2 nav-item-glass cursor-pointer d-flex align-items-center" 
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                    <div className="avatar-glow me-3 ms-1 flex-shrink-0">
                        <img 
                            src={doctor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=3b82f6&color=fff&bold=true`} 
                            alt="Avatar" width="45" height="45" className="rounded-circle border border-2 border-white shadow" style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className="d-flex flex-column">
                        <strong className="fw-bold text-truncate" style={{ fontSize: '15px', lineHeight: '1.2', maxWidth: '140px' }} title={`Bs. ${doctor.fullName}`}>
                            Bs. {doctor.fullName}
                        </strong>
                        <span className="text-info small fw-medium mt-1 text-truncate" style={{ fontSize: '11px', maxWidth: '140px' }} title={doctor.specialty}>
                            {doctor.specialty}
                        </span>
                    </div>
                    <i className={`bi bi-chevron-${isProfileOpen ? 'down' : 'up'} ms-auto text-white-50 fs-6 pe-1`}></i>
                </div>

                {isProfileOpen && (
                    <div className="dropdown-menu-dark dropdown-glass shadow-lg rounded-4 w-100 p-2 position-absolute" style={{ bottom: '100%', left: 0, marginBottom: '10px' }}>
                        <Link className="dropdown-item d-flex align-items-center gap-3 py-2 rounded-3 text-white nav-item-glass" to="/doctor/profile">
                            <i className="bi bi-person-badge fs-5"></i> Hồ sơ cá nhân
                        </Link>
                        <hr className="border-white opacity-10 my-2" />
                        <button className="dropdown-item d-flex align-items-center gap-3 py-2 rounded-3 text-danger fw-bold nav-item-glass w-100 border-0 text-start" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right fs-5"></i> Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorSidebar;