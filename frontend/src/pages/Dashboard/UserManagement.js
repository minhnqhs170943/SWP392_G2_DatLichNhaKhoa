import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './UserManagement.css';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/users`;

const ROLES = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Doctor' },
    { id: 3, name: 'Staff' },
    { id: 4, name: 'Patient' }
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [lockReason, setLockReason] = useState('');
    const [userToLock, setUserToLock] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) {
                setUsers(data.payload);
            }
        } catch (error) {
            console.error('Fetch users err:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Lọc dữ liệu
    const filteredUsers = users.filter(user => 
        user.FullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.Phone && user.Phone.includes(searchTerm))
    );

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset vế trang đầu khi tìm kiếm
    };

    const openAddModal = () => {
        setModalMode('add');
        setCurrentUser({
            FullName: '',
            Email: '',
            Phone: '',
            Password: '',
            RoleID: 3,
            IsActive: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setCurrentUser({ ...user, Password: '' });
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

    const validateForm = () => {
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!currentUser.FullName || !currentUser.Email || !currentUser.Phone || (modalMode === 'add' && !currentUser.Password)) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
            return false;
        }
        if (!emailRegex.test(currentUser.Email)) {
            alert('Email không sai định dạng!');
            return false;
        }
        if (!phoneRegex.test(currentUser.Phone)) {
            alert('Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03/05/07/08/09).');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        try {
            const url = modalMode === 'add' ? API_URL : `${API_URL}/${currentUser.UserID}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentUser)
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
                closeModal();
                alert(data.message || 'Thành công!');
            } else {
                alert(data.message || 'Có lỗi xảy ra.');
            }
        } catch (error) {
            console.error('Lỗi lưu user:', error);
            alert('Đã xảy ra lỗi hệ thống.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (user) => {
        if (user.IsActive === false) {
            alert("Tài khoản này đã bị khoá.");
            return;
        }
        setUserToLock(user);
        setLockReason('');
        setIsLockModalOpen(true);
    };

    const confirmLock = async () => {
        if (!lockReason.trim()) {
            alert("Vui lòng nhập lý do khoá.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/${userToLock.UserID}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: lockReason })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
                setIsLockModalOpen(false);
                setUserToLock(null);
                alert(data.message || "Khoá thành công");
            } else {
                alert(data.message || 'Không thể khoá người dùng');
            }
        } catch (error) {
            alert('Lỗi hệ thống khi khoá');
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

            <div className="um-search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                <input 
                    type="text" 
                    placeholder="Tìm theo Tên hoặc Email, SĐT..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
            </div>

            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
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
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Đang tải...</td></tr>
                        ) : paginatedUsers.map(user => (
                            <tr key={user.UserID}>
                                <td>#{user.UserID}</td>
                                <td className="fw-bold">{user.FullName}</td>
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
                                        <button className="delete-btn" onClick={() => handleDelete(user)} title="Khoá">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    Không tìm thấy dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px', gap: '5px' }}>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                        disabled={currentPage === 1}
                        style={{ padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button 
                            key={page} 
                            onClick={() => setCurrentPage(page)}
                            style={{ 
                                padding: '6px 12px', 
                                background: currentPage === page ? '#3b82f6' : '#fff', 
                                color: currentPage === page ? '#fff' : '#0f172a',
                                border: '1px solid #e2e8f0', 
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                        disabled={currentPage === totalPages}
                        style={{ padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

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
                                <label>Họ và Tên <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    name="FullName" 
                                    value={currentUser.FullName} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tên Đăng Nhập / Email <span className="text-danger">*</span></label>
                                <input 
                                    type="email" 
                                    name="Email" 
                                    value={currentUser.Email} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập địa chỉ email (Được dùng làm Tên đăng nhập)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Số Điện Thoại <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    name="Phone" 
                                    value={currentUser.Phone} 
                                    onChange={handleInputChange} 
                                    placeholder="Nhập số điện thoại (vd: 098...)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Mật Khẩu {modalMode === 'add' && <span className="text-danger">*</span>}</label>
                                <input 
                                    type="password" 
                                    name="Password" 
                                    value={currentUser.Password || ''} 
                                    onChange={handleInputChange} 
                                    placeholder={modalMode === 'add' ? "Nhập mật khẩu" : "Nhập để đổi mật khẩu (để trống nếu không đổi)"}
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
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Đang lưu...' : (modalMode === 'add' ? 'Thêm Mới' : 'Cập Nhật')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Lock Reason Modal */}
            {isLockModalOpen && (
                <div className="modal-overlay" onClick={() => setIsLockModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Lý Do Khoá Tài Khoản</h2>
                            <button className="close-modal-btn" onClick={() => setIsLockModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p>Bạn đang thực hiện khoá tài khoản của <strong>{userToLock?.FullName}</strong>.</p>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Lý do khoá <span className="text-danger">*</span>
                                </label>
                                <textarea 
                                    className="form-control" 
                                    rows="3" 
                                    placeholder="Nhập lý do khoá..."
                                    value={lockReason}
                                    onChange={e => setLockReason(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn-cancel" onClick={() => setIsLockModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' }}>Hủy</button>
                            <button className="btn-save" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }} onClick={confirmLock}>Khoá Tài Khoản</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
