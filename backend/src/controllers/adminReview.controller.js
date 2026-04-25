const adminReviewModel = require('../models/adminReview.model');

const getAdminReviews = async (req, res) => {
    try {
        const reviews = await adminReviewModel.getAllReviews({
            search: req.query.search || '',
        });

        return res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.error('Get admin reviews error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy danh sách review.' });
    }
};

const deleteAdminReview = async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id, 10);
        if (!reviewId) {
            return res.status(400).json({ success: false, message: 'ReviewID không hợp lệ.' });
        }

        const deleted = await adminReviewModel.deleteReviewById(reviewId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy review để xóa.' });
        }

        return res.status(200).json({ success: true, message: 'Xóa review thành công.' });
    } catch (error) {
        console.error('Delete admin review error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xóa review.' });
    }
};

module.exports = {
    getAdminReviews,
    deleteAdminReview,
};
