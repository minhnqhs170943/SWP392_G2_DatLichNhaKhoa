import { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import { changePasswordApi, getProfileApi, updateProfileApi } from '../../services/authService';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedUser && storedUser.UserID) {
                const data = await getProfileApi(storedUser.UserID);

                if (data.success && data.user) {
                    setProfile({
                        username: data.user.Username || '',
                        fullName: data.user.FullName || '',
                        email: data.user.Email || '',
                        phone: data.user.Phone || '',
                        address: data.user.Address || ''
                    });
                } else {
                    console.error("Lỗi lấy data:", data.message);
                }
            }
        };

        fetchUserData();
    }, []);

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser || !storedUser.UserID) {
            alert("Lỗi: Không xác định được danh tính người dùng!");
            return;
        }

        const payload = {
            fullName: profile.fullName,
            phone: profile.phone,
            address: profile.address
        };

        const data = await updateProfileApi(storedUser.UserID, payload);

        if (data.success) {
            const updatedUser = {
                ...storedUser,
                FullName: profile.fullName,
                Phone: profile.phone,
                Address: profile.address
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setIsEditing(false);
            alert('Thông tin cá nhân đã được cập nhật thành công!');
        } else {
            alert(data.message || 'Cập nhật thất bại!');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (passwords.newPassword.length < 6) {
            alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (!storedUser || !storedUser.UserID) {
            alert("Lỗi: Không xác định được danh tính người dùng!");
            return;
        }

        const data = await changePasswordApi(storedUser.UserID, passwords.newPassword);

        if (data.success) {
            alert('Đổi mật khẩu thành công!');
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } else {
            alert(data.message || 'Đổi mật khẩu thất bại!');
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' },
        mainContent: { backgroundColor: '#f8f9fa', flex: 1, padding: '100px 0 100px 0' },
        card: { backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: 'none', overflow: 'hidden' },
        sidebar: { backgroundColor: '#f8f9fa', borderRight: '1px solid #e9ecef', padding: '30px 20px', height: '100%' },
        avatar: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#4285f4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '48px', color: '#ffffff', fontWeight: '600' },
        userName: { textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '5px' },
        userEmail: { textAlign: 'center', fontSize: '14px', color: '#6c757d', marginBottom: '30px' },
        navItem: { display: 'flex', alignItems: 'center', padding: '12px 20px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '15px', fontWeight: '500' },
        navItemActive: { backgroundColor: '#4285f4', color: '#ffffff' },
        navItemInactive: { backgroundColor: 'transparent', color: '#6c757d' },
        navIcon: { marginRight: '12px', fontSize: '18px' },
        content: { padding: '40px' },
        title: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
        subtitle: { fontSize: '14px', color: '#6c757d', marginBottom: '30px' },
        formGroup: { marginBottom: '24px' },
        label: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px', display: 'block' },
        input: { width: '100%', padding: '12px 16px', fontSize: '15px', border: '1px solid #e0e0e0', borderRadius: '10px', transition: 'all 0.3s ease', backgroundColor: '#ffffff' },
        inputDisabled: { backgroundColor: '#f8f9fa', color: '#6c757d' },
        inputGroup: { position: 'relative' },
        eyeButton: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px' },
        btnPrimary: { backgroundColor: '#4285f4', color: '#ffffff', border: 'none', padding: '12px 30px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
        btnOutline: { backgroundColor: 'transparent', color: '#4285f4', border: '2px solid #4285f4', padding: '10px 25px', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', marginRight: '15px' },
        row: { display: 'flex', flexWrap: 'wrap', margin: '0 -12px' },
        col6: { flex: '0 0 50%', maxWidth: '50%', padding: '0 12px' },
        col12: { flex: '0 0 100%', maxWidth: '100%', padding: '0 12px' }
    };

    const EyeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
    const EyeOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
    const UserIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
    const LockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main style={styles.mainContent}>
                <div className="container">
                    <div style={styles.card}>
                        <div className="row g-0">
                            {/* Sidebar Trái */}
                            <div className="col-md-3">
                                <div style={styles.sidebar}>
                                    <div style={styles.avatar}>
                                        {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div style={styles.userName}>{profile.fullName}</div>
                                    <div style={styles.userEmail}>{profile.email}</div>

                                    <div
                                        style={{ ...styles.navItem, ...(activeTab === 'profile' ? styles.navItemActive : styles.navItemInactive) }}
                                        onClick={() => setActiveTab('profile')}
                                    >
                                        <span style={styles.navIcon}><UserIcon /></span>
                                        Thông tin cá nhân
                                    </div>

                                    <div
                                        style={{ ...styles.navItem, ...(activeTab === 'password' ? styles.navItemActive : styles.navItemInactive) }}
                                        onClick={() => setActiveTab('password')}
                                    >
                                        <span style={styles.navIcon}><LockIcon /></span>
                                        Đổi mật khẩu
                                    </div>
                                </div>
                            </div>

                            {/* Content Phải */}
                            <div className="col-md-9">
                                <div style={styles.content}>
                                    {activeTab === 'profile' ? (
                                        <>
                                            <h2 style={styles.title}>Thông tin cá nhân</h2>
                                            <p style={styles.subtitle}>Quản lý thông tin cá nhân của bạn</p>

                                            <form onSubmit={handleSaveProfile}>
                                                <div style={styles.row}>
                                                    <div style={styles.col12}>
                                                        <div style={styles.formGroup}>
                                                            <label style={styles.label}>Email</label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={profile.email}
                                                                disabled={true}
                                                                style={{ ...styles.input, ...styles.inputDisabled }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={styles.row}>
                                                    <div style={styles.col6}>
                                                        <div style={styles.formGroup}>
                                                            <label style={styles.label}>Họ và tên</label>
                                                            <input
                                                                type="text"
                                                                name="fullName"
                                                                value={profile.fullName}
                                                                onChange={handleProfileChange}
                                                                disabled={!isEditing}
                                                                style={{ ...styles.input, ...(!isEditing ? styles.inputDisabled : {}) }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={styles.col6}>
                                                        <div style={styles.formGroup}>
                                                            <label style={styles.label}>Số điện thoại</label>
                                                            <input
                                                                type="tel"
                                                                name="phone"
                                                                value={profile.phone}
                                                                onChange={handleProfileChange}
                                                                disabled={!isEditing}
                                                                style={{ ...styles.input, ...(!isEditing ? styles.inputDisabled : {}) }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={styles.row}>
                                                    <div style={styles.col12}>
                                                        <div style={styles.formGroup}>
                                                            <label style={styles.label}>Địa chỉ</label>
                                                            <input
                                                                type="text"
                                                                name="address"
                                                                value={profile.address}
                                                                onChange={handleProfileChange}
                                                                disabled={!isEditing}
                                                                style={{ ...styles.input, ...(!isEditing ? styles.inputDisabled : {}) }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '20px' }}>
                                                    {isEditing ? (
                                                        <>
                                                            <button type="button" style={styles.btnOutline} onClick={() => setIsEditing(false)}>Hủy</button>
                                                            <button type="submit" style={styles.btnPrimary}>Lưu thay đổi</button>
                                                        </>
                                                    ) : (
                                                        <button type="button" style={styles.btnPrimary} onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
                                                    )}
                                                </div>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            <h2 style={styles.title}>Đổi mật khẩu</h2>
                                            <p style={styles.subtitle}>Cập nhật mật khẩu để bảo mật tài khoản</p>

                                            <form onSubmit={handleChangePassword}>
                                                <div style={styles.col12}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Mật khẩu hiện tại</label>
                                                        <div style={styles.inputGroup}>
                                                            <input
                                                                type={showPasswords.current ? 'text' : 'password'}
                                                                name="currentPassword"
                                                                value={passwords.currentPassword}
                                                                onChange={handlePasswordChange}
                                                                placeholder="Nhập mật khẩu hiện tại"
                                                                style={styles.input}
                                                                required
                                                            />
                                                            <button type="button" style={styles.eyeButton} onClick={() => togglePasswordVisibility('current')}>
                                                                {showPasswords.current ? <EyeOffIcon /> : <EyeIcon />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={styles.col12}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Mật khẩu mới</label>
                                                        <div style={styles.inputGroup}>
                                                            <input
                                                                type={showPasswords.new ? 'text' : 'password'}
                                                                name="newPassword"
                                                                value={passwords.newPassword}
                                                                onChange={handlePasswordChange}
                                                                placeholder="Nhập mật khẩu mới"
                                                                style={styles.input}
                                                                required
                                                            />
                                                            <button type="button" style={styles.eyeButton} onClick={() => togglePasswordVisibility('new')}>
                                                                {showPasswords.new ? <EyeOffIcon /> : <EyeIcon />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={styles.col12}>
                                                    <div style={styles.formGroup}>
                                                        <label style={styles.label}>Xác nhận mật khẩu mới</label>
                                                        <div style={styles.inputGroup}>
                                                            <input
                                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                                name="confirmPassword"
                                                                value={passwords.confirmPassword}
                                                                onChange={handlePasswordChange}
                                                                placeholder="Nhập lại mật khẩu mới"
                                                                style={styles.input}
                                                                required
                                                            />
                                                            <button type="button" style={styles.eyeButton} onClick={() => togglePasswordVisibility('confirm')}>
                                                                {showPasswords.confirm ? <EyeOffIcon /> : <EyeIcon />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '20px' }}>
                                                    <button type="submit" style={styles.btnPrimary}>Cập nhật mật khẩu</button>
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