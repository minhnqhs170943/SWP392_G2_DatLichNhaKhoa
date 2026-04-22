import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminServices.css';

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        serviceName: '',
        description: '',
        price: '',
        isActive: true
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const filteredServices = services.filter(svc => 
        svc.ServiceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (svc.Description && svc.Description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
    const paginatedServices = filteredServices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/services');
            const data = await response.json();
            if (data.success) {
                setServices(data.services);
            }
        } catch (error) {
            console.error('Lỗi lấy dữ liệu dịch vụ:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const openModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                serviceName: service.ServiceName,
                description: service.Description || '',
                price: service.Price,
                isActive: service.IsActive
            });
        } else {
            setEditingService(null);
            setFormData({ serviceName: '', description: '', price: '', isActive: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingService 
                ? `http://localhost:5001/api/services/${editingService.ServiceID}`
                : 'http://localhost:5001/api/services';
            const method = editingService ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (data.success) {
                fetchServices();
                closeModal();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi lưu dịch vụ:', error);
            alert('Có lỗi xảy ra khi lưu dịch vụ!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) return;
        try {
            const response = await fetch(`http://localhost:5001/api/services/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                fetchServices();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Lỗi xóa dịch vụ:', error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    };

    return (
        <div className="admin-services">
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Quản Lý Dịch Vụ</h2>
                    <p className="text-muted">Thêm, sửa, xóa các dịch vụ nha khoa.</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openModal()}>
                    <Plus size={18} /> Thêm Dịch Vụ Mới
                </button>
            </div>

            <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên dịch vụ hoặc mô tả..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
            </div>

            {loading ? (
                <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle custom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên Dịch Vụ</th>
                                <th>Mô Tả</th>
                                <th>Giá</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedServices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">Không tìm thấy dịch vụ nào.</td>
                                </tr>
                            ) : (
                                paginatedServices.map((svc, index) => (
                                    <tr key={svc.ServiceID}>
                                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td className="fw-bold">{svc.ServiceName}</td>
                                    <td>{svc.Description && svc.Description.length > 50 ? svc.Description.substring(0, 50) + '...' : svc.Description}</td>
                                    <td className="text-success fw-bold">{formatCurrency(svc.Price)}</td>
                                    <td>
                                        <span className={`badge ${svc.IsActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {svc.IsActive ? 'Hoạt động' : 'Ngưng'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(svc)}>
                                            <Pencil size={16} />
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(svc.ServiceID)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
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

            {isModalOpen && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-dialog">
                        <div className="custom-modal-header">
                            <h5 className="m-0">{editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h5>
                            <button className="btn-close-modal" onClick={closeModal}><X size={20}/></button>
                        </div>
                        <div className="custom-modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Tên Dịch Vụ</label>
                                    <input 
                                        type="text" className="form-control" required
                                        value={formData.serviceName} 
                                        onChange={e => setFormData({...formData, serviceName: e.target.value})} 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mô Tả</label>
                                    <textarea 
                                        className="form-control" rows="3"
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                    ></textarea>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Giá (VNĐ)</label>
                                    <input 
                                        type="number" className="form-control" required min="0" step="1000"
                                        value={formData.price} 
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                    />
                                </div>
                                {editingService && (
                                    <div className="form-check mb-3">
                                        <input 
                                            className="form-check-input" type="checkbox" id="isActive"
                                            checked={formData.isActive}
                                            onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                        />
                                        <label className="form-check-label" htmlFor="isActive">
                                            Hoạt động
                                        </label>
                                    </div>
                                )}
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">{editingService ? 'Cập Nhật' : 'Lưu Dịch Vụ'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
