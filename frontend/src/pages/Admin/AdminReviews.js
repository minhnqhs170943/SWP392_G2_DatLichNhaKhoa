import React, { useCallback, useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import './AdminReviews.css';
import {
    fetchAdminReviews,
    deleteAdminReview,
} from '../../services/adminReviewApi';

const AdminReviews = () => {
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewSearch, setReviewSearch] = useState('');

    const loadReviews = useCallback(async () => {
        try {
            setLoadingReviews(true);
            const data = await fetchAdminReviews(reviewSearch);
            setReviews(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoadingReviews(false);
        }
    }, [reviewSearch]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa review này?')) return;
        try {
            await deleteAdminReview(id);
            await loadReviews();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="admin-reviews">
            <div className="section-card">
                <div className="section-head">
                    <div>
                        <h3 className="section-title">Quản Lý Review</h3>
                        <p className="section-subtitle">Danh sách review của người dùng, hỗ trợ tìm kiếm và xóa.</p>
                    </div>
                </div>

                <div className="toolbar">
                    <div className="input-group">
                        <span className="input-group-text"><Search size={16} /></span>
                        <input
                            value={reviewSearch}
                            onChange={(e) => setReviewSearch(e.target.value)}
                            className="form-control"
                            placeholder="Tìm theo bệnh nhân, bác sĩ, nội dung..."
                        />
                    </div>
                    <button className="btn btn-outline-primary" onClick={loadReviews}>Tìm</button>
                </div>

                {loadingReviews ? (
                    <div className="text-center p-4"><div className="spinner-border text-primary" /></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Bệnh nhân</th>
                                    <th>Bác sĩ</th>
                                    <th>Đánh giá</th>
                                    <th>Nội dung</th>
                                    <th>Ngày tạo</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-4">Chưa có review.</td></tr>
                                ) : reviews.map((r, idx) => (
                                    <tr key={r.ReviewID}>
                                        <td>{idx + 1}</td>
                                        <td>{r.UserName}</td>
                                        <td>{r.DoctorName}</td>
                                        <td>{r.Rating}/5</td>
                                        <td style={{ maxWidth: 320 }}>{r.Comment}</td>
                                        <td>{new Date(r.CreatedAt).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReview(r.ReviewID)}>
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
