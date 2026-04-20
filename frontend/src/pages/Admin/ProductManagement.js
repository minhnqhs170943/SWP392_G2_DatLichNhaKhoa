import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Eye, Search, ImageIcon } from 'lucide-react';
import './ProductManagement.css';

const API_URL = 'http://localhost:5001/api/admin/products';

const defaultForm = {
    ProductName: '',
    Brand: '',
    Description: '',
    Price: '',
    IsActive: true
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentProduct, setCurrentProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const fetchProducts = useCallback(async (search = '') => {
        try {
            setLoading(true);
            const url = search.trim() ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setProducts(data.payload);
        } catch (err) {
            console.error("Fetch products error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchProducts]);

    const openAddModal = () => {
        setModalMode('add');
        setCurrentProduct({ ...defaultForm });
        setImageFile(null);
        setImagePreview('');
        setErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setModalMode('edit');
        setCurrentProduct({ ...product });
        setImageFile(null);
        setImagePreview(product.ImageURL || '');
        setErrors({});
        setIsModalOpen(true);
    };

    const openViewModal = (product) => {
        setModalMode('view');
        setCurrentProduct({ ...product });
        setImagePreview(product.ImageURL || '');
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setImageFile(null);
        setImagePreview('');
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, image: 'Chỉ chấp nhận file JPG, PNG, WEBP.' }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'File ảnh không được vượt quá 5MB.' }));
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!currentProduct.ProductName?.trim()) errs.ProductName = 'Tên sản phẩm là bắt buộc.';
        if (!currentProduct.Price && currentProduct.Price !== 0) errs.Price = 'Giá là bắt buộc.';
        else if (isNaN(parseFloat(currentProduct.Price)) || parseFloat(currentProduct.Price) < 0) errs.Price = 'Giá không hợp lệ.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);

        const formData = new FormData();
        formData.append('ProductName', currentProduct.ProductName);
        formData.append('Brand', currentProduct.Brand || '');
        formData.append('Description', currentProduct.Description || '');
        formData.append('Price', currentProduct.Price);
        formData.append('IsActive', currentProduct.IsActive ? 'true' : 'false');
        if (imageFile) formData.append('image', imageFile);

        try {
            if (modalMode === 'add') {
                const res = await fetch(API_URL, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    setProducts([data.payload, ...products]);
                    alert('Thêm sản phẩm thành công!');
                    closeModal();
                } else {
                    alert(data.message || 'Lỗi thêm sản phẩm');
                }
            } else {
                const res = await fetch(`${API_URL}/${currentProduct.ProductID}`, { method: 'PUT', body: formData });
                const data = await res.json();
                if (data.success) {
                    setProducts(products.map(p => p.ProductID === currentProduct.ProductID ? data.payload : p));
                    alert('Cập nhật thành công!');
                    closeModal();
                } else {
                    alert(data.message || 'Lỗi cập nhật sản phẩm');
                }
            }
        } catch (err) {
            console.error("Save product error:", err);
            alert('Đã xảy ra lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm("Bạn có chắc chắn muốn ẩn sản phẩm này?")) {
            try {
                const res = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    setProducts(products.map(p => p.ProductID === productId ? { ...p, IsActive: false } : p));
                    alert(data.message || 'Ẩn sản phẩm thành công');
                } else {
                    alert(data.message || 'Không thể ẩn sản phẩm này');
                }
            } catch (err) {
                alert('Đã xảy ra lỗi khi xóa');
            }
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="product-management-container">
            <div className="product-management-header">
                <h1>Quản Lý Sản Phẩm</h1>
                <button className="add-product-btn" onClick={openAddModal}>
                    <Plus size={20} />
                    Thêm Sản Phẩm
                </button>
            </div>

            {/* Search */}
            <div className="pm-search-bar-wrapper">
                <Search size={18} className="pm-search-icon" />
                <input
                    type="text"
                    className="pm-search-input"
                    placeholder="Tìm theo tên sản phẩm, thương hiệu..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="pm-clear-search-btn" onClick={() => setSearchTerm('')}><X size={16} /></button>
                )}
            </div>

            {/* Table */}
            <div className="product-table-wrapper">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Tên Sản Phẩm</th>
                            <th>Thương Hiệu</th>
                            <th>Giá</th>
                            <th>Trạng Thái</th>
                            <th>Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="empty-cell">Đang tải dữ liệu...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan="7" className="empty-cell">Không tìm thấy sản phẩm</td></tr>
                        ) : (
                            products.map((product, index) => (
                                <tr key={product.ProductID}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {product.ImageURL ? (
                                            <img src={product.ImageURL} alt={product.ProductName}
                                                className="product-thumb" />
                                        ) : (
                                            <div className="product-thumb-placeholder">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="product-name-cell">{product.ProductName}</td>
                                    <td>{product.Brand || '-'}</td>
                                    <td className="price-cell">{formatPrice(product.Price)}</td>
                                    <td>
                                        <span className={`status-badge ${product.IsActive ? 'active' : 'inactive'}`}>
                                            {product.IsActive ? 'Đang bán' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="pm-view-btn" onClick={() => openViewModal(product)} title="Xem">
                                                <Eye size={16} />
                                            </button>
                                            <button className="pm-edit-btn" onClick={() => openEditModal(product)} title="Sửa">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="pm-delete-btn" onClick={() => handleDelete(product.ProductID)} title="Ẩn">
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
            {isModalOpen && currentProduct && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="pm-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalMode === 'add' ? 'Thêm Sản Phẩm' : modalMode === 'edit' ? 'Chỉnh Sửa Sản Phẩm' : 'Chi Tiết Sản Phẩm'}
                            </h2>
                            <button className="close-modal-btn" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <div className="pm-modal-body">
                            {/* Image upload */}
                            <div className="pm-image-section">
                                <div className="pm-image-preview" onClick={() => modalMode !== 'view' && fileInputRef.current?.click()}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" />
                                    ) : (
                                        <div className="pm-image-placeholder">
                                            <ImageIcon size={40} />
                                            <span>{modalMode !== 'view' ? 'Nhấn để tải ảnh lên' : 'Chưa có ảnh'}</span>
                                        </div>
                                    )}
                                    {modalMode !== 'view' && imagePreview && (
                                        <div className="pm-image-overlay">
                                            <span>Đổi ảnh</span>
                                        </div>
                                    )}
                                </div>
                                {modalMode !== 'view' && (
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                )}
                                {errors.image && <span className="error-msg">{errors.image}</span>}
                            </div>

                            <div className="pm-form-cols">
                                <div className="form-group">
                                    <label>Tên Sản Phẩm <span className="required">*</span></label>
                                    <input type="text" name="ProductName" value={currentProduct.ProductName}
                                        onChange={handleInputChange} placeholder="Nhập tên sản phẩm"
                                        disabled={modalMode === 'view'} className={errors.ProductName ? 'input-error' : ''} />
                                    {errors.ProductName && <span className="error-msg">{errors.ProductName}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Thương Hiệu</label>
                                    <input type="text" name="Brand" value={currentProduct.Brand || ''}
                                        onChange={handleInputChange} placeholder="Nhập thương hiệu"
                                        disabled={modalMode === 'view'} />
                                </div>
                                <div className="form-group">
                                    <label>Giá (VNĐ) <span className="required">*</span></label>
                                    <input type="number" name="Price" value={currentProduct.Price}
                                        onChange={handleInputChange} placeholder="Nhập giá"
                                        disabled={modalMode === 'view'} min="0"
                                        className={errors.Price ? 'input-error' : ''} />
                                    {errors.Price && <span className="error-msg">{errors.Price}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Mô Tả</label>
                                    <textarea name="Description" value={currentProduct.Description || ''}
                                        onChange={handleInputChange} placeholder="Nhập mô tả sản phẩm"
                                        disabled={modalMode === 'view'} rows={3} />
                                </div>
                                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" name="IsActive" id="productIsActive"
                                        checked={currentProduct.IsActive} onChange={handleInputChange}
                                        disabled={modalMode === 'view'} style={{ width: 'auto' }} />
                                    <label htmlFor="productIsActive" style={{ cursor: 'pointer', margin: 0 }}>Đang bán</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={closeModal}>{modalMode === 'view' ? 'Đóng' : 'Hủy'}</button>
                            {modalMode !== 'view' && (
                                <button className="btn-save" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Đang lưu...' : (modalMode === 'add' ? 'Thêm Mới' : 'Cập Nhật')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
