import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { changePasswordApi, getProfileApi, updateProfileApi } from '../../services/authService';
import '../../styles/Profile.css';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({ username: '', fullName: '', email: '', phone: '', address: '' });
    
    const [savedProfile, setSavedProfile] = useState({ username: '', fullName: '', email: '', phone: '', address: '' });

    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    const [profileErrors, setProfileErrors] = useState({});
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' }); 
    const [passErrors, setPassErrors] = useState({});
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedUser && storedUser.UserID) {
                const data = await getProfileApi(storedUser.UserID);

                if (data.success && data.user) {
                    const fetchedData = {
                        username: data.user.Username || '',
                        fullName: data.user.FullName || '',
                        email: data.user.Email || '',
                        phone: data.user.Phone || '',
                        address: data.user.Address || ''
                    };
                    setProfile(fetchedData);
                    setSavedProfile(fetchedData); 
                }
            }
        };

        fetchUserData();
    }, []);

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

    const validateProfile = () => {
        let tempErrors = {};
        let isValid = true;
        const nameRegex = /^[\p{L}\s]+$/u;
        const trimmedName = profile.fullName.trim();
        const trimmedAddress = profile.address.trim();

        if (!trimmedName) {
            tempErrors.fullName = 'Họ và tên không được để trống';
            isValid = false;
        } else if (trimmedName.length > 255) {
            tempErrors.fullName = 'Họ và tên không vượt quá 255 ký tự';
            isValid = false;
        } else if (!nameRegex.test(trimmedName)) {
            tempErrors.fullName = 'Họ và tên không được chứa số hoặc ký tự đặc biệt';
            isValid = false;
        }

        if (!trimmedAddress) {
            tempErrors.address = 'Địa chỉ không được để trống';
            isValid = false;
        } else if (trimmedAddress.length > 255) {
            tempErrors.address = 'Địa chỉ không vượt quá 255 ký tự';
            isValid = false;
        }

        setProfileErrors(tempErrors);
        return { isValid, trimmedName, trimmedAddress };
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileErrors({});
        setProfileMsg({ type: '', text: '' });

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.UserID) return;

        const { isValid, trimmedName, trimmedAddress } = validateProfile();
        if (!isValid) return;

        const payload = {
            fullName: trimmedName,
            address: trimmedAddress
        };

        try {
            const data = await updateProfileApi(storedUser.UserID, payload);

            if (data.success) {
                const updatedUser = { ...storedUser, FullName: trimmedName, Address: trimmedAddress };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setProfileMsg({ type: 'success', text: 'Thông tin cá nhân đã được cập nhật thành công!' });
                setIsEditing(false);
                setSavedProfile(prev => ({ ...prev, fullName: trimmedName, address: trimmedAddress }));
            } else {
                if (data.field) setProfileErrors({ [data.field]: data.message });
                else setProfileMsg({ type: 'error', text: data.message || 'Cập nhật thất bại!' });
            }
        } catch (error) {
            setProfileMsg({ type: 'error', text: 'Lỗi kết nối máy chủ!' });
        }
    };

    const validatePassword = () => {
        let tempErrors = {};
        let isValid = true;
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
        
        const oldP = passwords.currentPassword.trim();
        const newP = passwords.newPassword.trim();
        const confP = passwords.confirmPassword.trim();

        if (!oldP) {
            tempErrors.currentPassword = "Vui lòng nhập mật khẩu cũ"; isValid = false;
        } else if (oldP.length < 6 || oldP.length > 36) {
            tempErrors.currentPassword = "Mật khẩu cũ phải từ 6 đến 36 ký tự"; isValid = false;
        }

        if (!newP) {
            tempErrors.newPassword = "Mật khẩu mới không được để trống"; isValid = false;
        } else if (newP.length < 6 || newP.length > 36) {
            tempErrors.newPassword = "Mật khẩu phải từ 6 đến 36 ký tự"; isValid = false;
        } else if (!passRegex.test(newP)) {
            tempErrors.newPassword = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số"; isValid = false;
        } else if (newP === oldP) {
            tempErrors.newPassword = "Mật khẩu mới không được trùng mật khẩu cũ"; isValid = false;
        }

        if (!confP) {
            tempErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"; isValid = false;
        } else if (newP !== confP) {
            tempErrors.confirmPassword = "Mật khẩu xác nhận không khớp"; isValid = false;
        }

        setPassErrors(tempErrors);
        return { isValid, oldP, newP };
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPassErrors({});
        setPassMsg({ type: '', text: '' });

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.UserID) return;

        const { isValid, oldP, newP } = validatePassword();
        if (!isValid) return;

        try {
            const data = await changePasswordApi(storedUser.UserID, { oldPassword: oldP, newPassword: newP });

            if (data.success) {
                setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                if (data.field) {
                    const errorField = data.field === 'oldPassword' ? 'currentPassword' : data.field;
                    setPassErrors({ [errorField]: data.message });
                } else {
                    setPassMsg({ type: 'error', text: data.message || 'Đổi mật khẩu thất bại!' });
                }
            }
        } catch (error) {
            setPassMsg({ type: 'error', text: 'Lỗi kết nối máy chủ!' });
        }
    };

    const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
    const EyeOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
    const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
    const LockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="profile-main">
                <div className="container">
                    <div className="profile-card">
                        <div className="row g-0">
                            {/* Sidebar */}
                            <div className="col-md-3">
                                <div className="profile-sidebar">
                                    <div className="profile-avatar">
                                        {savedProfile.fullName ? savedProfile.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="profile-user-name">{savedProfile.fullName}</div>
                                    <div className="profile-user-email">{savedProfile.email}</div>

                                    <div
                                        className={`profile-nav-item ${activeTab === 'profile' ? 'active' : 'inactive'}`}
                                        onClick={() => { setActiveTab('profile'); setProfileErrors({}); setProfileMsg({type:'', text:''}); }}
                                    >
                                        <span className="profile-nav-icon"><UserIcon /></span>
                                        Thông tin cá nhân
                                    </div>

                                    <div
                                        className={`profile-nav-item ${activeTab === 'password' ? 'active' : 'inactive'}`}
                                        onClick={() => { setActiveTab('password'); setPassErrors({}); setPassMsg({type:'', text:''}); }}
                                    >
                                        <span className="profile-nav-icon"><LockIcon /></span>
                                        Đổi mật khẩu
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="col-md-9">
                                <div className="profile-content">
                                    {activeTab === 'profile' ? (
                                        <>
                                            <h2 className="profile-title">Thông tin cá nhân</h2>
                                            <p className="profile-subtitle">Quản lý thông tin cá nhân của bạn</p>

                                            {profileMsg.text && (
                                                <div className={`alert py-2 px-3 small mb-4 ${profileMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                                    {profileMsg.text}
                                                </div>
                                            )}

                                            <form onSubmit={handleSaveProfile}>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Email (Không thể thay đổi)</label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={profile.email}
                                                                disabled={true}
                                                                className="profile-input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Họ và tên <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="fullName"
                                                                value={profile.fullName}
                                                                onChange={handleProfileChange}
                                                                disabled={!isEditing}
                                                                className={`profile-input ${profileErrors.fullName ? 'error' : ''}`}
                                                            />
                                                            {profileErrors.fullName && <small className="profile-error-text">{profileErrors.fullName}</small>}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Số điện thoại (Không thể thay đổi)</label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={profile.phone}
                                                                disabled={true}
                                                                className="profile-input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Địa chỉ <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                name="address"
                                                                value={profile.address}
                                                                onChange={handleProfileChange}
                                                                disabled={!isEditing}
                                                                className={`profile-input ${profileErrors.address ? 'error' : ''}`}
                                                            />
                                                            {profileErrors.address && <small className="profile-error-text">{profileErrors.address}</small>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '20px' }}>
                                                    {isEditing ? (
                                                        <>
                                                            <button type="button" className="profile-btn-outline" onClick={() => { 
                                                                setIsEditing(false); 
                                                                setProfileErrors({});
                                                                setProfile(savedProfile);
                                                            }}>Hủy</button>
                                                            <button type="submit" className="profile-btn-primary">Lưu thay đổi</button>
                                                        </>
                                                    ) : (
                                                        <button type="button" className="profile-btn-primary" onClick={() => setIsEditing(true)}>Chỉnh sửa thông tin</button>
                                                    )}
                                                </div>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="profile-title">Đổi mật khẩu</h2>
                                            <p className="profile-subtitle">Cập nhật mật khẩu để bảo mật tài khoản</p>

                                            {passMsg.text && (
                                                <div className={`alert py-2 px-3 small mb-4 ${passMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                                    {passMsg.text}
                                                </div>
                                            )}

                                            <form onSubmit={handleChangePassword}>
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Mật khẩu hiện tại <span className="text-danger">*</span></label>
                                                            <div className="profile-input-group">
                                                                <input
                                                                    type={showPasswords.current ? 'text' : 'password'}
                                                                    name="currentPassword"
                                                                    value={passwords.currentPassword}
                                                                    onChange={handlePasswordChange}
                                                                    placeholder="Nhập mật khẩu hiện tại"
                                                                    className={`profile-input ${passErrors.currentPassword ? 'error' : ''}`}
                                                                />
                                                                <button type="button" className="profile-eye-button" onClick={() => togglePasswordVisibility('current')}>
                                                                    {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                                                                </button>
                                                            </div>
                                                            {passErrors.currentPassword && <small className="profile-error-text">{passErrors.currentPassword}</small>}
                                                        </div>
                                                    </div>

                                                    <div className="col-12">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Mật khẩu mới <span className="text-danger">*</span></label>
                                                            <div className="profile-input-group">
                                                                <input
                                                                    type={showPasswords.new ? 'text' : 'password'}
                                                                    name="newPassword"
                                                                    value={passwords.newPassword}
                                                                    onChange={handlePasswordChange}
                                                                    placeholder="Nhập mật khẩu mới"
                                                                    className={`profile-input ${passErrors.newPassword ? 'error' : ''}`}
                                                                />
                                                                <button type="button" className="profile-eye-button" onClick={() => togglePasswordVisibility('new')}>
                                                                    {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                                                                </button>
                                                            </div>
                                                            {passErrors.newPassword && <small className="profile-error-text">{passErrors.newPassword}</small>}
                                                        </div>
                                                    </div>

                                                    <div className="col-12">
                                                        <div className="profile-form-group">
                                                            <label className="profile-label">Xác nhận mật khẩu mới <span className="text-danger">*</span></label>
                                                            <div className="profile-input-group">
                                                                <input
                                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                                    name="confirmPassword"
                                                                    value={passwords.confirmPassword}
                                                                    onChange={handlePasswordChange}
                                                                    placeholder="Nhập lại mật khẩu mới"
                                                                    className={`profile-input ${passErrors.confirmPassword ? 'error' : ''}`}
                                                                />
                                                                <button type="button" className="profile-eye-button" onClick={() => togglePasswordVisibility('confirm')}>
                                                                    {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                                                                </button>
                                                            </div>
                                                            {passErrors.confirmPassword && <small className="profile-error-text">{passErrors.confirmPassword}</small>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '20px' }}>
                                                    <button type="submit" className="profile-btn-primary">Cập nhật mật khẩu</button>
                                                </div>
                                            </form>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;