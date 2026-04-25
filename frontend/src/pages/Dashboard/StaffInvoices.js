import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Banknote, Eye, FileText, CheckCircle, Clock, Download, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import StaffLayout from '../../layouts/StaffLayout'; 
import './StaffInvoices.css';

const StaffInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // 1. Hàm gọi API lấy danh sách hóa đơn từ Backend
    const fetchInvoices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/payment/appointment-invoices');
            const result = await response.json();
            if (result.success) {
                setInvoices(result.data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách hóa đơn:", error);
        }
    };

    // 2. Tự động cập nhật khi quay lại trang
    useEffect(() => {
        fetchInvoices(); 

        const handleFocus = () => {
            fetchInvoices(); 
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // 3. Logic tìm kiếm và lọc
    const filteredInvoices = invoices.filter(inv => {
        // ĐỒNG BỘ: Chuyển trạng thái về chữ HOA để so sánh chính xác
        const currentStatus = inv.status?.toUpperCase() || 'UNPAID';
        const targetFilter = filterStatus?.toUpperCase();

        const matchesStatus = filterStatus === 'All' || currentStatus === targetFilter;
        
        const patientName = inv.patientName || '';
        const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             `#INV-${inv.id}`.includes(searchTerm) ||
                             `#APT-${inv.appointmentId}`.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    // 4. Xác nhận thu Tiền Mặt
    const handleCashPayment = (id) => {
        Swal.fire({
            title: 'Xác nhận thu tiền mặt',
            text: `Bạn xác nhận đã thu đủ tiền cho hóa đơn #INV-${id}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Đã thu tiền',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // SỬA LỖI: Đảm bảo sử dụng đúng endpoint PUT để cập nhật trạng thái PAID
                    const response = await fetch(`http://localhost:5000/api/payment/appointment-invoices/${id}/cash`, {
                        method: 'PUT'
                    });
                    const data = await response.json();

                    if (data.success) {
                        await fetchInvoices(); // Cập nhật lại danh sách ngay lập tức
                        Swal.fire('Thành công', 'Hóa đơn đã được cập nhật trạng thái ĐÃ THANH TOÁN', 'success');
                    } else {
                        Swal.fire('Lỗi', data.message || 'Không thể xác nhận thanh toán', 'error');
                    }
                } catch (error) {
                    Swal.fire('Lỗi', 'Lỗi kết nối đến máy chủ', 'error');
                }
            }
        });
    };

    // 5. Gọi API PayOS
    const handlePayOS = async (inv) => {
        try {
            Swal.fire({ title: 'Đang tạo mã QR...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
            
            const response = await fetch('http://localhost:5000/api/payment/appointment-invoices/payos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    invoiceId: inv.id,
                    returnUrl: `${window.location.origin}/payment/success?orderCode=APT-${inv.appointmentId}`,
                    cancelUrl: `${window.location.origin}/payment/cancel`
                })
            });
            const result = await response.json();

            if (result.success) {
                Swal.close();
                navigate('/payment/qr', {
                    state: {
                        paymentData: {
                            orderId: `APT-${inv.appointmentId}`,
                            checkoutUrl: result.data.checkoutUrl,
                            qrCode: result.data.qrCode,
                            amount: inv.amount
                        }
                    }
                });
            } else {
                Swal.fire('Lỗi', result.message || 'Không thể tạo link thanh toán', 'error');
            }
        } catch (error) {
            Swal.fire('Lỗi', 'Lỗi kết nối PayOS', 'error');
        }
    };

    return (
        <StaffLayout>
            <div className="staff-invoices">
                <div className="page-header">
                    <div className="header-left">
                        <h2>Quản Lý Hóa Đơn</h2>
                        <div className="breadcrumb">
                            <span>Dashboard</span>
                            <span>/</span>
                            <span className="active">Hóa đơn</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="btn-export"><Download size={16}/> Xuất Excel</button>
                        <button className="btn-create"><Plus size={16}/> Tạo Hóa Đơn</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-wrapper">
                    <div className="stat-card">
                        <div className="stat-info"><p>Tổng hóa đơn</p><h3>{invoices.length}</h3></div>
                        <div className="stat-icon blue"><FileText size={24}/></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <p>Chờ thanh toán</p>
                            <h3 style={{color: '#f59e0b'}}>
                                {/* Đếm tất cả trạng thái khác PAID */}
                                {invoices.filter(i => i.status?.toUpperCase() !== 'PAID').length}
                            </h3>
                        </div>
                        <div className="stat-icon orange"><Clock size={24}/></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-info">
                            <p>Đã thanh toán</p>
                            <h3 style={{color: '#10b981'}}>
                                {/* Đếm chính xác trạng thái PAID */}
                                {invoices.filter(i => i.status?.toUpperCase() === 'PAID').length}
                            </h3>
                        </div>
                        <div className="stat-icon green"><CheckCircle size={24}/></div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filters-wrapper">
                    <div className="filter-group" style={{ flex: 2 }}>
                        <label>Tìm kiếm</label>
                        <div className="search-input-wrapper">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Tìm tên bệnh nhân, mã HĐ, mã lịch hẹn..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Trạng thái</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">Tất cả trạng thái</option>
                            <option value="Unpaid">Chờ thanh toán</option>
                            <option value="Paid">Đã thanh toán</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                <div className="table-wrapper">
                    <table className="invoices-table">
                        <thead>
                            <tr>
                                <th>Mã HĐ</th>
                                <th>Mã Lịch Hẹn</th>
                                <th>Bệnh Nhân</th>
                                <th>Dịch Vụ</th>
                                <th>Ngày Lập</th>
                                <th>Tổng Tiền</th>
                                <th>Trạng Thái</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => {
                                // Xác định trạng thái PAID chính xác
                                const isPaid = inv.status?.toUpperCase() === 'PAID';
                                return (
                                    <tr key={inv.id}>
                                        <td className="inv-code">#INV-{inv.id}</td>
                                        <td style={{ fontWeight: 600, color: '#64748b' }}>#APT-{inv.appointmentId}</td>
                                        <td>
                                            <div className="patient-info">
                                                <div className="patient-avatar">{inv.patientName ? inv.patientName.charAt(0) : '?'}</div>
                                                <div className="patient-details">
                                                    <h4>{inv.patientName}</h4>
                                                    <p>{inv.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{inv.service}</td>
                                        <td>{inv.date}</td>
                                        <td className="amount-cell">{inv.amount?.toLocaleString('vi-VN')}đ</td>
                                        <td>
                                            {/* Cập nhật CSS class và Label dựa trên PAID */}
                                            <span className={`status-badge ${isPaid ? 'completed' : 'pending'}`}>
                                                {isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {!isPaid ? (
                                                    <>
                                                        <button className="btn-action btn-approve" onClick={() => handlePayOS(inv)} title="Thanh toán QR">
                                                            <CreditCard size={16}/> QR
                                                        </button>
                                                        <button className="btn-action btn-complete" onClick={() => handleCashPayment(inv.id)} title="Tiền mặt">
                                                            <Banknote size={16}/> Tiền mặt
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="btn-action btn-view"><Eye size={16}/> Xem</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                        Không tìm thấy hóa đơn nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </StaffLayout>
    );
};

export default StaffInvoices;