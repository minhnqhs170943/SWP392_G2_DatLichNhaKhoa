import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react';
import './UserManagement.css';

const API_URL = 'http://localhost:5001/api/admin/users';

const ROLES = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Staff' },
    { id: 3, name: 'Patient' },
    { id: 4, name: 'Doctor' }
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.success) {
                setUsers(data.payload);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setCurrentUser({
            Username: '',
            FullName: '',
            Email: '',
            Phone: '',
            Address: '',
            RoleID: 3,
            IsActive: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setCurrentUser({ ...user, Address: user.Address || '' });
        setIsModalOpen(true);
    };

    const openViewModal = (user) => {
        setModalMode('view');
        setCurrentUser({ ...user, Address: user.Address || '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentUser(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            if (modalMode === 'add') {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentUser) // roleId logic is handled in backend
                });
                const data = await response.json();
                if (data.success) {
                    setUsers([data.payload, ...users]);
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
                    setUsers(users.map(user => user.UserID === currentUser.UserID ? data.payload : user));
                    closeModal();
                } else {
                    alert(data.message || 'Lỗi cập nhật người dùng');
                }
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Đã xảy ra lỗi khi lưu");
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn khoá người dùng này? Tài khoản sẽ bị chuyển sang trạng thái Ngưng Hoạt Động.")) {
            try {
                const response = await fetch(`${API_URL}/${userId}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    // Update user's active state in local state
                    setUsers(users.map(user => user.UserID === userId ? { ...user, IsActive: false } : user));
                    alert(data.message || "Khoá thành công");
                } else {
                    alert(data.message || "Không thể xoá tài khoản này");
                }
            } catch (error) {
                console.error("Delete error:", error);
                alert("Đã xảy ra lỗi khi xoá");
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

            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên Đăng Nhập</th>
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
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    Không có dữ liệu người dùng
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user.UserID}>
                                    <td>{index + 1}</td>
                                    <td>{user.Username}</td>
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
                                            <button className="view-btn" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => openViewModal(user)} title="Xem Chi Tiết">
                                                <Eye size={16} />
                                            </button>
                                            <button className="edit-btn" onClick={() => openEditModal(user)} title="Sửa">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(user.UserID)} title="Xoá/Khoá">
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
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Thêm Người Dùng' : modalMode === 'edit' ? 'Chỉnh Sửa Người Dùng' : 'Chi Tiết Người Dùng'}</h2>
                            <button className="close-modal-btn" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên Đăng Nhập</label>
                                <input 
                                    type="text" 
                                    name="Username" 
                                    value={currentUser.Username} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập tên đăng nhập"
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Họ và Tên</label>
                                <input 
                                    type="text" 
                                    name="FullName" 
                                    value={currentUser.FullName} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập họ và tên"
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="Email" 
                                    value={currentUser.Email || ''} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập địa chỉ email"
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Số Điện Thoại</label>
                                <input 
                                    type="text" 
                                    name="Phone" 
                                    value={currentUser.Phone} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập số điện thoại"
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa Chỉ</label>
                                <input 
                                    type="text" 
                                    name="Address" 
                                    value={currentUser.Address || ''} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập địa chỉ của bạn"
                                    disabled={modalMode === 'view'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Vai Trò</label>
                                <select 
                                    name="RoleID" 
                                    value={currentUser.RoleID} 
                                    onChange={handleInputChange}
                                    disabled={modalMode === 'view'}
                                >
                                    {ROLES.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                <input 
                                    type="checkbox" 
                                    name="IsActive" 
                                    id="isActive"
                                    checked={currentUser.IsActive} 
                                    onChange={handleInputChange}
                                    disabled={modalMode === 'view'}
                                    style={{ width: 'auto' }}
                                />
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
