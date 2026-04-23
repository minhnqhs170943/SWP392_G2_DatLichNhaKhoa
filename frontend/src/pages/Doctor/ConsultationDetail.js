import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DoctorSidebar from '../../components/Doctor/DoctorSidebar';
import { completeConsultation, getAvailableProducts, getConsultationDetail } from '../../services/consultationDetailApi';

const ConsultationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [appointmentInfo, setAppointmentInfo] = useState({
        patientName: '',
        phone: '',
        date: '',
        time: '',
        services: [],
        patientNote: '',
        medicalRecord: ''
    });

    const [medicalRecord, setMedicalRecord] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpNote, setFollowUpNote] = useState('');
    const [availableProducts, setAvailableProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                // Gọi song song 2 API
                const [detailResult, productResult] = await Promise.all([
                    getConsultationDetail(id),
                    getAvailableProducts()
                ]);

                if (detailResult.success) {
                    setAppointmentInfo(detailResult.data);
                    if (detailResult.data.medicalRecord) {
                        setMedicalRecord(detailResult.data.medicalRecord);
                    }
                    setError(null);
                } else {
                    setError(detailResult.message);
                }

                if (productResult.success) {
                    setAvailableProducts(productResult.data);
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
                setError(err.message || "Không thể kết nối đến máy chủ.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, navigate]);

    const handleSelectProduct = (product) => {
        const isExist = selectedProducts.find(p => p.id === product.id);
        if (isExist) {
            setSelectedProducts(selectedProducts.map(p =>
                p.id === product.id ? { ...p, qty: p.qty + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, qty: 1 }]);
        }
        setSearchTerm('');
    };

    const handleRemoveProduct = (prodId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== prodId));
    };

    const updateQty = (prodId, delta) => {
        setSelectedProducts(selectedProducts.map(p => {
            if (p.id === prodId) {
                const newQty = p.qty + delta;
                return { ...p, qty: newQty > 0 ? newQty : 1 };
            }
            return p;
        }));
    };

    const filteredProducts = availableProducts.filter(p =>
        p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const serviceTotal = appointmentInfo.services.reduce((sum, s) => sum + s.price, 0);
    const productTotal = selectedProducts.reduce((sum, p) => sum + (p.price * p.qty), 0);
    const grandTotal = serviceTotal + productTotal;

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const handleComplete = async () => {
        if (!medicalRecord.trim()) {
            alert("Vui lòng ghi chú chẩn đoán / bệnh án trước khi hoàn thành!");
            return;
        }

        // 2. Xác nhận với bác sĩ
        const confirmMessage = selectedProducts.length > 0
            ? `Xác nhận hoàn thành ca khám với ${selectedProducts.length} sản phẩm kê đơn?`
            : "Xác nhận hoàn thành ca khám này?";

        if (window.confirm(confirmMessage)) {
            try {
                setLoading(true);

                const payload = {
                    appointmentId: id,
                    medicalRecord: medicalRecord,
                    products: selectedProducts,
                    followUpDate: followUpDate || null,
                    followUpNote: followUpNote || "",
                    grandTotal: grandTotal
                };

                const result = await completeConsultation(payload);

                if (result.success) {
                    alert("Chúc mừng! Ca khám đã hoàn tất và hóa đơn đã được chuyển cho Lễ tân.");
                    navigate('/doctor/consultation');
                }
            } catch (err) {
                console.error("Lỗi hoàn thành ca khám:", err);
                alert("Đã có lỗi xảy ra: " + (err.message || "Không thể kết nối đến máy chủ"));
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="dashboard-bg d-flex">
            <DoctorSidebar />

            <div className="flex-grow-1 p-4 p-xl-5" style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-light rounded-circle shadow-sm" style={{ width: '45px', height: '45px' }}>
                            <i className="bi bi-arrow-left fs-5"></i>
                        </button>
                        <div>
                            <h2 className="fw-bolder text-dark mb-0">Hồ sơ khám bệnh</h2>
                            <p className="text-muted mb-0">Mã ca khám: #{id || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="glass-card rounded-4 p-4 mb-4 border-top border-4 border-primary shadow-sm bg-white">
                            <div className="text-center mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '70px', height: '70px' }}>
                                    <i className="bi bi-person-fill fs-1"></i>
                                </div>
                                <h5 className="fw-bold mb-0">{appointmentInfo.patientName}</h5>
                                <span className="text-muted small"><i className="bi bi-telephone-fill me-1"></i> {appointmentInfo.phone}</span>
                            </div>
                            <div className="bg-light rounded-3 p-3 text-center d-flex justify-content-between">
                                <div>
                                    <small className="text-muted d-block">Ngày khám</small>
                                    <strong className="text-dark">{appointmentInfo.date}</strong>
                                </div>
                                <div className="vr opacity-25"></div>
                                <div>
                                    <small className="text-muted d-block">Giờ hẹn</small>
                                    <strong className="text-dark">{appointmentInfo.time}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-4 p-4 shadow-sm bg-white">
                            <h6 className="fw-bold text-dark mb-3"><i className="bi bi-clipboard2-pulse text-primary me-2"></i>Dịch vụ thực hiện</h6>
                            <ul className="list-group list-group-flush mb-3">
                                {appointmentInfo.services.map((srv, idx) => (
                                    <li key={idx} className="list-group-item bg-transparent px-0 d-flex justify-content-between align-items-center border-bottom">
                                        <span className="fw-medium text-secondary">{srv.name}</span>
                                        <strong className="text-dark">{formatCurrency(srv.price)}</strong>
                                    </li>
                                ))}
                            </ul>
                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <span className="text-muted fw-medium">Phí dịch vụ:</span>
                                <h5 className="fw-bold text-primary mb-0">{formatCurrency(serviceTotal)}</h5>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="glass-card rounded-4 p-4 h-100 d-flex flex-column shadow-sm bg-white">
                            {appointmentInfo.patientNote && (
                                <div className="alert alert-info border-0 mb-4 rounded-3 d-flex gap-3" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                                    <i className="bi bi-chat-quote-fill fs-4 mt-1"></i>
                                    <div>
                                        <strong className="d-block mb-1">Ghi chú của bệnh nhân:</strong>
                                        <span style={{ fontStyle: 'italic' }}>{appointmentInfo.patientNote}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark"><i className="bi bi-journal-medical text-danger me-2"></i>Chẩn đoán & Hồ sơ bệnh án <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control bg-light border-0 shadow-none p-3 rounded-3"
                                    rows="4"
                                    placeholder="Ghi nhận tình trạng răng miệng, chẩn đoán, phác đồ điều trị (Lưu vào bệnh án điện tử)..."
                                    value={medicalRecord}
                                    onChange={(e) => setMedicalRecord(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="mb-4 flex-grow-1 position-relative">
                                <label className="form-label fw-bold text-dark"><i className="bi bi-capsule text-success me-2"></i>Kê đơn Sản phẩm / Thuốc</label>
                                <div className="input-group mb-2 shadow-sm rounded-3 overflow-hidden border border-light">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0 shadow-none py-2 fw-medium text-dark"
                                        placeholder="Gõ tên sản phẩm để tìm kiếm..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {searchTerm && (
                                    <div className="position-absolute w-100 shadow-lg rounded-3 bg-white border overflow-auto" style={{ zIndex: 100, maxHeight: '250px', top: '75px' }}>
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p.id} // Sửa ProductID -> id
                                                className="d-flex align-items-center p-2 border-bottom"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleSelectProduct(p)}
                                            >
                                                <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="rounded-2 border me-3" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark small">{p.name}</div>
                                                    <div className="text-primary fw-bold" style={{ fontSize: '13px' }}>{formatCurrency(p.price)}</div>
                                                </div>
                                                <i className="bi bi-plus-lg text-success"></i>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedProducts.length > 0 && (
                                    <div className="table-responsive rounded-3 border mt-3">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="px-3">SẢN PHẨM</th>
                                                    <th className="text-center">SỐ LƯỢNG</th>
                                                    <th className="text-end">THÀNH TIỀN</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedProducts.map(p => (
                                                    <tr key={p.id}>
                                                        <td className="px-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} className="rounded-2 border" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                                                <div>
                                                                    <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{p.name}</div>
                                                                    <div className="text-muted" style={{ fontSize: '12px' }}>{formatCurrency(p.price)}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ width: '130px' }}>
                                                            <div className="input-group input-group-sm rounded-pill border overflow-hidden">
                                                                <button className="btn btn-light" onClick={() => updateQty(p.id, -1)}>-</button>
                                                                <input type="text" className="form-control text-center border-0 bg-white" value={p.qty} readOnly />
                                                                <button className="btn btn-light" onClick={() => updateQty(p.id, 1)}>+</button>
                                                            </div>
                                                        </td>
                                                        <td className="text-end fw-bold">{formatCurrency(p.price * p.qty)}</td>
                                                        <td className="text-center">
                                                            <button className="btn btn-sm text-danger" onClick={() => handleRemoveProduct(p.id)}>
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4 bg-light p-3 rounded-4 border">
                                <label className="form-label fw-bold text-dark"><i className="bi bi-alarm text-warning me-2"></i>Hẹn tái khám (Nếu có)</label>
                                <input type="date" className="form-control border-0 shadow-sm mb-2" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                                <input type="text" className="form-control border-0 shadow-sm small" placeholder="Lý do tái khám..." value={followUpNote} onChange={e => setFollowUpNote(e.target.value)} />
                            </div>

                            <div className="bg-primary bg-opacity-10 rounded-4 p-4 mt-auto border border-primary border-opacity-25 shadow-sm">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-primary">Tiền dịch vụ:</span>
                                    <strong>{formatCurrency(serviceTotal)}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-success">Tiền thuốc & Sản phẩm:</span>
                                    <strong>{formatCurrency(productTotal)}</strong>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-end mb-4">
                                    <span className="text-dark fw-bold fs-5">TỔNG CỘNG:</span>
                                    <h2 className="text-primary fw-bold mb-0">{formatCurrency(grandTotal)}</h2>
                                </div>
                                <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow" onClick={handleComplete}>
                                    HOÀN THÀNH & XUẤT HÓA ĐƠN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationDetail;