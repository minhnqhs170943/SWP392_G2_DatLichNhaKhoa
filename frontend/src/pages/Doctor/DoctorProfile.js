import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useRef, useState } from 'react';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import { uploadAvatarApi } from '../../services/authService';
import { changeDoctorPasswordApi, getDoctorProfileApi, updateDoctorProfileApi } from '../../services/doctorProfileApi';
import '../../styles/Profile.css';

const DoctorProfile = () => {
    // 3 Tabs: profile (Cá nhân) -> doctorInfo (Chuyên môn) -> password (Mật khẩu)
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    // [GIẢI THÍCH SỬA]: Thêm các trường specialty, experience, description vào state
    const [profile, setProfile] = useState({
        username: '', fullName: '', email: '', phone: '', address: '',
        specialty: '', experienceYears: '', bio: ''
    });

    const [savedProfile, setSavedProfile] = useState({ ...profile });

    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    const [profileErrors, setProfileErrors] = useState({});
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
    const [passErrors, setPassErrors] = useState({});
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.UserID || user.id || user.doctorId;

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                try {
                    const data = await getDoctorProfileApi(userId);
                    if (data.success && data.data) {
                        const fetchedData = {
                            username: data.data.Username || '',
                            fullName: data.data.FullName || '',
                            email: data.data.Email || '',
                            phone: data.data.Phone || '',
                            address: data.data.Address || '',
                            specialty: data.data.Specialty || '',
                            experienceYears: data.data.ExperienceYears || '',
                            bio: data.data.Bio || '',
                            avatarUrl: data.data.Avatar || ''
                        };
                        setProfile(fetchedData);
                        setSavedProfile(fetchedData);
                        setAvatarUrl(fetchedData.avatarUrl);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin bác sĩ:", error);
                }
            }
        };
        fetchUserData();
    }, [userId]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileErrors({});
        setProfileMsg({ type: '', text: '' });

        if (!profile.fullName.trim() || !profile.address.trim()) {
            setProfileMsg({ type: 'error', text: 'Họ tên và Địa chỉ không được để trống!' });
            return;
        }

        const payload = {
            FullName: profile.fullName,
            Phone: profile.phone,
            Address: profile.address,
            Specialty: profile.specialty,
            ExperienceYears: profile.experienceYears,
            Bio: profile.bio
        };

        try {
            const data = await updateDoctorProfileApi(userId, payload);
            if (data.success) {
                // Cập nhật localStorage để Sidebar thay đổi tên theo
                const updatedUser = { ...user, FullName: profile.fullName, Specialty: profile.specialty };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('authChange'));

                setProfileMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
                setIsEditing(false);
                setSavedProfile({ ...profile });
            }
        } catch (error) {
            setProfileMsg({ type: 'error', text: 'Lỗi cập nhật hồ sơ!' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassErrors({});
        setPassMsg({ type: '', text: '' });

        // Validate cơ bản trên Frontend
        if (passwords.newPassword.length < 6) {
            setPassErrors({ newPassword: 'Mật khẩu phải có ít nhất 6 ký tự' });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPassErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        try {
            const payload = {
                oldPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            };

            // Gọi API mới của DoctorProfile (không cần truyền userId)
            const data = await changeDoctorPasswordApi(payload);

            if (data.success) {
                setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswords({ current: false, new: false, confirm: false }); // Reset mắt hiển thị pass
            }
        } catch (error) {
            // Hiển thị lỗi bắn ra từ Backend (Sai mật khẩu cũ, v.v...)
            const errorMsg = error.message;
            if (errorMsg.includes('Mật khẩu hiện tại')) {
                setPassErrors({ currentPassword: errorMsg });
            } else {
                setPassMsg({ type: 'error', text: errorMsg || 'Đổi mật khẩu thất bại!' });
            }
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await uploadAvatarApi(userId, file);
            if (data.success) {
                setAvatarUrl(data.avatarUrl);
                const updatedUser = { ...user, Avatar: data.avatarUrl };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('authChange'));
                setProfileMsg({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
            }
        } catch (error) {
            setProfileMsg({ type: 'error', text: 'Lỗi khi tải ảnh lên!' });
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    // Các icon SVG dùng lại của bạn
    const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
    const MedIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>);
    const LockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
    const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
    const EyeOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bolder gradient-text mb-1" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Hồ Sơ Của Tôi</h1>
                        <p className="text-muted fw-medium mb-0">Quản lý thông tin cá nhân và hồ sơ chuyên môn</p>
                    </div>
                </div>

                <div className="profile-card shadow-sm border-0 glass-card">
                    <div className="row g-0">
                        {/* SIDEBAR BÊN TRONG CỦA PROFILE */}
                        <div className="col-md-3 border-end">
                            <div className="profile-sidebar p-4">
                                <div className="profile-avatar-wrapper mx-auto mb-3" onClick={() => !isUploading && fileInputRef.current.click()} style={{ position: 'relative', width: '120px', height: '120px', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }} />
                                    ) : (
                                        <div className="profile-avatar d-flex align-items-center justify-content-center text-white bg-primary rounded-circle" style={{ width: '100%', height: '100%', fontSize: '40px' }}>
                                            {savedProfile.fullName ? savedProfile.fullName.charAt(0).toUpperCase() : 'B'}
                                        </div>
                                    )}
                                    <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-2 border-white" style={{ width: '35px', height: '35px' }}>
                                        {isUploading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-camera-fill"></i>}
                                    </div>
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="d-none" />

                                <div className="text-center mb-4">
                                    <h5 className="fw-bold text-dark mb-1">Bs. {savedProfile.fullName}</h5>
                                    <span className="text-muted small">{savedProfile.specialty || 'Chưa cập nhật chuyên khoa'}</span>
                                </div>

                                <div className={`profile-nav-item ${activeTab === 'profile' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('profile')}>
                                    <span className="profile-nav-icon"><UserIcon /></span> Thông tin cá nhân
                                </div>
                                {/* [GIẢI THÍCH SỬA]: Tab mới nằm ở giữa */}
                                <div className={`profile-nav-item ${activeTab === 'doctorInfo' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('doctorInfo')}>
                                    <span className="profile-nav-icon"><MedIcon /></span> Thông tin chuyên môn
                                </div>
                                <div className={`profile-nav-item ${activeTab === 'password' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('password')}>
                                    <span className="profile-nav-icon"><LockIcon /></span> Đổi mật khẩu
                                </div>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="col-md-9">
                            <div className="profile-content p-4 p-xl-5">
                                {profileMsg.text && (
                                    <div className={`alert py-3 border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 ${profileMsg.type === 'success' ? 'alert-success text-success' : 'alert-danger text-danger'}`}>
                                        <i className={`bi ${profileMsg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
                                        {profileMsg.text}
                                    </div>
                                )}

                                {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                                {activeTab === 'profile' && (
                                    <form onSubmit={handleSaveProfile} className="fade-in-up">
                                        <h4 className="fw-bold text-dark mb-4 border-bottom pb-3">Thông tin cá nhân</h4>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Họ và tên <span className="text-danger">*</span></label>
                                                    <input type="text" name="fullName" value={profile.fullName} onChange={handleProfileChange} disabled={!isEditing} className="profile-input" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Số điện thoại <span className="text-danger">*</span></label>
                                                    <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!isEditing} className="profile-input" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Email (Cố định)</label>
                                                    <input type="email" value={profile.email} disabled className="profile-input opacity-75" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Địa chỉ <span className="text-danger">*</span></label>
                                                    <input type="text" name="address" value={profile.address} onChange={handleProfileChange} disabled={!isEditing} className="profile-input" />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            {isEditing ? (
                                                <div className="d-flex gap-2">
                                                    <button type="button" className="profile-btn-outline" onClick={() => { setIsEditing(false); setProfile(savedProfile); }}>Hủy</button>
                                                    <button type="submit" className="profile-btn-primary">Lưu thay đổi</button>
                                                </div>
                                            ) : (
                                                <button type="button" className="profile-btn-primary" onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</button>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* TAB 2: THÔNG TIN CHUYÊN MÔN */}
                                {activeTab === 'doctorInfo' && (
                                    <form onSubmit={handleSaveProfile} className="fade-in-up">
                                        <h4 className="fw-bold text-dark mb-4 border-bottom pb-3">Thông tin chuyên môn</h4>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Chuyên khoa chính</label>
                                                    <input type="text" name="specialty" value={profile.specialty} onChange={handleProfileChange} disabled={!isEditing} placeholder="VD: Niềng răng..." className="profile-input" />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Số năm kinh nghiệm</label>
                                                    <input type="number" min="0" name="experienceYears" value={profile.experienceYears} onChange={handleProfileChange} disabled={!isEditing} placeholder="VD: 5" className="profile-input" />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Giới thiệu ngắn (Tiểu sử)</label>
                                                    <textarea name="bio" value={profile.bio} onChange={handleProfileChange} disabled={!isEditing} rows="4" placeholder="Viết một đoạn ngắn giới thiệu (Bio)..." className="profile-input" style={{ resize: 'vertical', padding: '12px' }}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            {isEditing ? (
                                                <div className="d-flex gap-2">
                                                    <button type="button" className="profile-btn-outline" onClick={() => { setIsEditing(false); setProfile(savedProfile); }}>Hủy</button>
                                                    <button type="submit" className="profile-btn-primary">Lưu thay đổi</button>
                                                </div>
                                            ) : (
                                                <button type="button" className="profile-btn-primary" onClick={() => setIsEditing(true)}>Cập nhật chuyên môn</button>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* TAB 3: ĐỔI MẬT KHẨU */}
                                {activeTab === 'password' && (
                                    <form onSubmit={handleChangePassword} className="fade-in-up">
                                        <h4 className="fw-bold text-dark mb-4 border-bottom pb-3">Đổi mật khẩu</h4>
                                        {passMsg.text && (
                                            <div className={`alert py-3 border-0 shadow-sm rounded-3 d-flex align-items-center gap-2 ${passMsg.type === 'success' ? 'alert-success text-success' : 'alert-danger text-danger'}`}>
                                                {passMsg.text}
                                            </div>
                                        )}
                                        <div className="row" style={{ maxWidth: '500px' }}>
                                            <div className="col-12">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Mật khẩu hiện tại <span className="text-danger">*</span></label>
                                                    <div className="profile-input-group">
                                                        <input type={showPasswords.current ? 'text' : 'password'} name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="profile-input" />
                                                        <button type="button" className="profile-eye-button" onClick={() => togglePasswordVisibility('current')}>
                                                            {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Mật khẩu mới <span className="text-danger">*</span></label>
                                                    <div className="profile-input-group">
                                                        <input type={showPasswords.new ? 'text' : 'password'} name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="profile-input" />
                                                        <button type="button" className="profile-eye-button" onClick={() => togglePasswordVisibility('new')}>
                                                            {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="profile-form-group">
                                                    <label className="profile-label">Xác nhận mật khẩu mới <span className="text-danger">*</span></label>
                                                    <div className="profile-input-group">
                                                        <input type={showPasswords.confirm ? 'text' : 'password'} name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className="profile-input" />
                                                        <button type="button" className="profile-eye-button" onClick={() => togglePasswordVisibility('confirm')}>
                                                            {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                                                        </button>
                                                    </div>
                                                    {passErrors.confirmPassword && <small className="text-danger mt-1 d-block">{passErrors.confirmPassword}</small>}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            <button type="submit" className="profile-btn-primary">Đổi mật khẩu an toàn</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;