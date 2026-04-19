import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import './UserManagement.css';

const MOCK_USERS = [
    { UserID: 1, Username: 'admin', FullName: 'Quản Trị Viên', Email: 'admin@nhakhoa.com', Phone: '0123456789', RoleID: 1, RoleName: 'Admin', IsActive: true },
    { UserID: 2, Username: 'staff1', FullName: 'Staff Nhã Ca', Email: 'staff1@nhakhoa.com', Phone: '0987654321', RoleID: 2, RoleName: 'Staff', IsActive: true },
    { UserID: 3, Username: 'user1', FullName: 'Nguyễn Văn A', Email: 'nguyenvana@gmail.com', Phone: '0345678912', RoleID: 3, RoleName: 'Patient', IsActive: true },
    { UserID: 4, Username: 'user2', FullName: 'Trần Thị B', Email: 'tranthib@gmail.com', Phone: '0912345678', RoleID: 3, RoleName: 'Patient', IsActive: false },
];

const ROLES = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Staff' },
    { id: 3, name: 'Patient' },
    { id: 4, name: 'Doctor' }
];

const UserManagement = () => {
    const [users, setUsers] = useState(MOCK_USERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentUser, setCurrentUser] = useState(null);

    const openAddModal = () => {
        setModalMode('add');
        setCurrentUser({
            Username: '',
            FullName: '',
            Email: '',
            Phone: '',
            RoleID: 3,
            IsActive: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setCurrentUser({ ...user });
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

    const handleSave = () => {
        if (modalMode === 'add') {
            const newUser = {
                ...currentUser,
                UserID: users.length > 0 ? Math.max(...users.map(u => u.UserID)) + 1 : 1,
                RoleName: ROLES.find(r => r.id === parseInt(currentUser.RoleID))?.name || 'Unknown'
            };
            setUsers([...users, newUser]);
        } else {
            setUsers(users.map(user => {
                if (user.UserID === currentUser.UserID) {
                    return {
                        ...currentUser,
                        RoleName: ROLES.find(r => r.id === parseInt(currentUser.RoleID))?.name || 'Unknown'
                    };
                }
                return user;
            }));
        }
        closeModal();
    };

    const handleDelete = (userId) => {
        if (window.confirm("Bạn có chắc chắn muốn xoá người dùng này?")) {
            setUsers(users.filter(user => user.UserID !== userId));
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
                            <th>ID</th>
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
                        {users.map(user => (
                            <tr key={user.UserID}>
                                <td>#{user.UserID}</td>
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
                                        <button className="edit-btn" onClick={() => openEditModal(user)} title="Sửa">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(user.UserID)} title="Xoá">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    Không có dữ liệu người dùng
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Thêm Người Dùng' : 'Chỉnh Sửa Người Dùng'}</h2>
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
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="Email" 
                                    value={currentUser.Email} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập địa chỉ email"
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
                                />
                            </div>
                            <div className="form-group">
                                <label>Vai Trò</label>
                                <select 
                                    name="RoleID" 
                                    value={currentUser.RoleID} 
                                    onChange={handleInputChange}
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
                                    style={{ width: 'auto' }}
                                />
                                <label htmlFor="isActive" style={{ cursor: 'pointer', margin: 0 }}>Tài khoản đang hoạt động</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>Hủy</button>
                            <button className="btn-save" onClick={handleSave}>
                                {modalMode === 'add' ? 'Thêm Mới' : 'Cập Nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
