import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Download, FileText, ShoppingBag, Calendar, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminInvoices.css';

const AdminInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:5001/api/admin/invoices';
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterType) params.append('type', filterType);
            if (filterStatus) params.append('status', filterStatus);

            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setInvoices(data.payload);
                setCurrentPage(1); // Reset to first page on new fetch
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách hóa đơn:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, filterType, filterStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchInvoices();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchInvoices]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Paid':
            case 'Completed':
                return <span className="status-badge status-paid"><CheckCircle size={14} /> Đã thanh toán</span>;
            case 'Unpaid':
            case 'Pending':
                return <span className="status-badge status-pending"><Clock size={14} /> Chờ thanh toán</span>;
            case 'Cancelled':
                return <span className="status-badge status-cancelled"><AlertCircle size={14} /> Đã hủy</span>;
            default:
                return <span className="status-badge status-default">{status}</span>;
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE) || 1;
    const paginatedInvoices = invoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="admin-invoices-container">
            <div className="page-header">
                <div className="header-info">
                    <h1>Quản Lý Hóa Đơn</h1>
                    <p>Theo dõi và quản lý tất cả các giao dịch thanh toán từ lịch hẹn và đơn hàng.</p>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo Mã HĐ, Tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <div className="filter-item">
                        <Filter size={16} />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">Tất cả loại</option>
                            <option value="Appointment">Lịch hẹn khám</option>
                            <option value="Order">Đơn hàng sản phẩm</option>
                        </select>
                    </div>

                    <div className="filter-item">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="Paid">Đã thanh toán</option>
                            <option value="Unpaid">Chờ thanh toán</option>
                            <option value="Cancelled">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="invoices-table-card">
                <div className="table-responsive">
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>Mã HĐ</th>
                                <th>Ngày Lập</th>
                                <th>Khách Hàng</th>
                                <th>Loại Giao Dịch</th>
                                <th>Tổng Tiền</th>
                                <th>Trạng Thái</th>
                                {/* <th>Hành Động</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="loading-row">
                                        <div className="spinner"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-row">Không tìm thấy hóa đơn nào.</td>
                                </tr>
                            ) : (
                                paginatedInvoices.map((inv) => (
                                    <tr key={inv.InvoiceID}>
                                        <td className="invoice-id">#INV-{inv.InvoiceID}</td>
                                        <td className="invoice-date">{formatDate(inv.IssuedDate)}</td>
                                        <td className="customer-info">
                                            <div className="name">{inv.CustomerName || 'Khách vãng lai'}</div>
                                            <div className="email">{inv.CustomerEmail}</div>
                                        </td>
                                        <td className="transaction-type">
                                            {inv.AppointmentID ? (
                                                <span className="type-tag type-appointment">
                                                    <Calendar size={14} /> Hẹn khám
                                                </span>
                                            ) : (
                                                <span className="type-tag type-order">
                                                    <ShoppingBag size={14} /> Đơn hàng
                                                </span>
                                            )}
                                        </td>
                                        <td className="amount">{formatCurrency(inv.TotalAmount)}</td>
                                        <td>{getStatusBadge(inv.InvoiceStatus)}</td>
                                        {/* <td className="actions">
                                            <button className="action-btn view" title="Xem chi tiết">
                                                <Eye size={18} />
                                            </button>
                                            <button className="action-btn print" title="In hóa đơn">
                                                <FileText size={18} />
                                            </button>
                                            <button className="action-btn download" title="Tải PDF">
                                                <Download size={18} />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '5px' }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                                padding: '8px 16px',
                                background: currentPage === page ? '#3b82f6' : '#fff',
                                color: currentPage === page ? '#fff' : '#1e293b',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: currentPage === page ? '600' : '400'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminInvoices;
