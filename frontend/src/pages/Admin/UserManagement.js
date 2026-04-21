import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Eye, Search } from 'lucide-react';
import './UserManagement.css';

const API_URL = 'http://localhost:5001/api/admin/users';

const ROLES = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Staff' },
    { id: 3, name: 'Patient' },
    { id: 4, name: 'Doctor' }
];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    const fetchUsers = useCallback(async (search = '') => {
        try {
            setLoading(true);
            const url = search.trim() ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setUsers(data.payload);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchUsers]);

    const openAddModal = () => {
        setModalMode('add');
        setCurrentUser({ FullName: '', Email: '', Phone: '', Address: '', RoleID: 3, IsActive: true, Password: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setCurrentUser({ ...user, Address: user.Address || '', Password: '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const openViewModal = (user) => {
        setModalMode('view');
        setCurrentUser({ ...user, Address: user.Address || '' });
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentUser(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!currentUser.FullName?.trim()) errs.FullName = 'Họ và tên là bắt buộc.';
        if (!currentUser.Email?.trim()) errs.Email = 'Email là bắt buộc.';
        else if (!isValidEmail(currentUser.Email)) errs.Email = 'Email không đúng định dạng.';
        if (!currentUser.Phone?.trim()) errs.Phone = 'Số điện thoại là bắt buộc.';
        else if (!isValidPhone(currentUser.Phone)) errs.Phone = 'SĐT phải có 10 số, bắt đầu 03/05/07/08/09.';
        if (modalMode === 'add') {
            if (!currentUser.Password?.trim()) errs.Password = 'Mật khẩu là bắt buộc.';
            else if (currentUser.Password.length < 6) errs.Password = 'Mật khẩu phải ít nhất 6 ký tự.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        try {
            if (modalMode === 'add') {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentUser)
                });
                const data = await response.json();
                if (data.success) {
                    setUsers([data.payload, ...users]);
                    alert('Thêm người dùng thành công!');
                    closeModal();
                } else {
                    alert(data.message || 'Lỗi thêm người dùng');
                }
            } else {
                const response = await fetch(`${API_URL}/${currentUser.UserID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentUser)
                });
                const data = await response.json();
                if (data.success) {
                    setUsers(users.map(u => u.UserID === currentUser.UserID ? data.payload : u));
                    alert('Cập nhật thành công!');
                    closeModal();
                } else {
                    alert(data.message || 'Lỗi cập nhật người dùng');
                }
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Đã xảy ra lỗi khi lưu: " + error.message);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn khoá người dùng này?")) {
            try {
                const response = await fetch(`${API_URL}/${userId}`, { method: 'DELETE' });
                const data = await response.json();
                if (data.success) {
                    setUsers(users.map(u => u.UserID === userId ? { ...u, IsActive: false } : u));
                    alert(data.message || "Khoá thành công");
                } else {
                    alert(data.message || "Không thể khoá tài khoản này");
                }
            } catch (error) {
                console.error("Delete error:", error);
                alert("Đã xảy ra lỗi khi khoá");
            }
        }
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h1>Quản Lý Người Dùng</h1>
                <button className="add-user-btn" onClick={openAddModal}>
                    <Plus size={20} />
                    Thêm Người Dùng
                </button>
            </div>

            {/* Search bar */}
            <div className="search-bar-wrapper">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Tìm theo tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Họ và Tên</th>
                            <th>Email</th>
                            <th>Số Điện Thoại</th>
                            <th>Vai Trò</th>
                            <th>Trạng Thái</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không tìm thấy người dùng</td></tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.UserID}>
                                    <td>{index + 1}</td>
                                    <td>{user.FullName}</td>
                                    <td>{user.Email}</td>
                                    <td>{user.Phone}</td>
                                    <td>{user.RoleName}</td>
                                    <td>
                                        <span className={`status-badge ${user.IsActive ? 'active' : 'inactive'}`}>
                                            {user.IsActive ? 'Hoạt động' : 'Đã khoá'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="view-btn" onClick={() => openViewModal(user)} title="Xem Chi Tiết">
                                                <Eye size={16} />
                                            </button>
                                            <button className="edit-btn" onClick={() => openEditModal(user)} title="Sửa">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(user.UserID)} title="Khoá">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && currentUser && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalMode === 'add' ? 'Thêm Người Dùng' : modalMode === 'edit' ? 'Chỉnh Sửa Người Dùng' : 'Chi Tiết Người Dùng'}
                            </h2>
                            <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Họ và Tên <span className="required">*</span></label>
                                <input type="text" name="FullName" value={currentUser.FullName} onChange={handleInputChange}
                                    placeholder="Nhập họ và tên" disabled={modalMode === 'view'} className={errors.FullName ? 'input-error' : ''} />
                                {errors.FullName && <span className="error-msg">{errors.FullName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Email <span className="required">*</span></label>
                                <input type="email" name="Email" value={currentUser.Email || ''} onChange={handleInputChange}
                                    placeholder="name@example.com" disabled={modalMode === 'view'} className={errors.Email ? 'input-error' : ''} />
                                {errors.Email && <span className="error-msg">{errors.Email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Số Điện Thoại <span className="required">*</span></label>
                                <input type="text" name="Phone" value={currentUser.Phone || ''} onChange={handleInputChange}
                                    placeholder="09xxxxxxxx" disabled={modalMode === 'view'} className={errors.Phone ? 'input-error' : ''} />
                                {errors.Phone && <span className="error-msg">{errors.Phone}</span>}
                            </div>
                            <div className="form-group">
                                <label>Địa Chỉ</label>
                                <input type="text" name="Address" value={currentUser.Address || ''} onChange={handleInputChange}
                                    placeholder="Nhập địa chỉ" disabled={modalMode === 'view'} />
                            </div>
                            <div className="form-group">
                                <label>Vai Trò</label>
                                <select name="RoleID" value={currentUser.RoleID} onChange={handleInputChange} disabled={modalMode === 'view'}>
                                    {ROLES.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            {modalMode !== 'view' && (
                                <div className="form-group">
                                    <label>
                                        {modalMode === 'add' ? <>Mật Khẩu <span className="required">*</span></> : 'Đổi Mật Khẩu (để trống nếu không đổi)'}
                                    </label>
                                    <input type="password" name="Password" value={currentUser.Password || ''} onChange={handleInputChange}
                                        placeholder={modalMode === 'add' ? 'Tối thiểu 6 ký tự' : 'Nhập mật khẩu mới (nếu muốn đổi)'}
                                        className={errors.Password ? 'input-error' : ''} />
                                    {errors.Password && <span className="error-msg">{errors.Password}</span>}
                                </div>
                            )}
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" name="IsActive" id="isActive" checked={currentUser.IsActive}
                                    onChange={handleInputChange} disabled={modalMode === 'view'} style={{ width: 'auto' }} />
                                <label htmlFor="isActive" style={{ cursor: 'pointer', margin: 0 }}>Tài khoản đang hoạt động</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>{modalMode === 'view' ? 'Đóng' : 'Hủy'}</button>
                            {modalMode !== 'view' && (
                                <button className="btn-save" onClick={handleSave}>
                                    {modalMode === 'add' ? 'Thêm Mới' : 'Cập Nhật'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
