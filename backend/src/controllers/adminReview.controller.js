const adminReviewModel = require('../models/adminReview.model');

const parseActorId = (req) => {
    const fromBody = parseInt(req.body?.actorId, 10);
    const fromToken = parseInt(req.user?.userId, 10);
    if (fromToken) return fromToken;
    if (fromBody) return fromBody;
    return null;
};

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

const getAdminBannedWords = async (req, res) => {
    try {
        const words = await adminReviewModel.getBannedWords({
            search: req.query.search || '',
        });

        return res.status(200).json({
            success: true,
            data: words,
        });
    } catch (error) {
        console.error('Get banned words error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lấy danh sách từ cấm.' });
    }
};

const createAdminBannedWord = async (req, res) => {
    try {
        const word = String(req.body.word || '').trim();
        const reason = req.body.reason ? String(req.body.reason).trim() : null;
        if (!word) {
            return res.status(400).json({ success: false, message: 'Từ cấm không được để trống.' });
        }
        if (word.length > 255) {
            return res.status(400).json({ success: false, message: 'Từ cấm tối đa 255 ký tự.' });
        }
        if (reason && reason.length > 500) {
            return res.status(400).json({ success: false, message: 'Lý do tối đa 500 ký tự.' });
        }

        const created = await adminReviewModel.createBannedWord({
            word,
            reason,
            createdBy: parseActorId(req),
        });

        return res.status(201).json({
            success: true,
            message: 'Thêm từ cấm thành công.',
            data: created,
        });

    } catch (error) {
        if (String(error.message || '').includes('UNIQUE')) {
            return res.status(409).json({ success: false, message: 'Từ cấm đã tồn tại.' });
        }
        console.error('Create banned word error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi thêm từ cấm.' });
    }
};

const updateAdminBannedWord = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ success: false, message: 'ID từ cấm không hợp lệ.' });
        }

        const word = String(req.body.word || '').trim();
        const reason = req.body.reason ? String(req.body.reason).trim() : null;
        const isActive = req.body.is_active !== undefined ? !!req.body.is_active : !!req.body.isActive;

        if (!word) {
            return res.status(400).json({ success: false, message: 'Từ cấm không được để trống.' });
        }
        if (word.length > 255) {
            return res.status(400).json({ success: false, message: 'Từ cấm tối đa 255 ký tự.' });
        }
        if (reason && reason.length > 500) {
            return res.status(400).json({ success: false, message: 'Lý do tối đa 500 ký tự.' });
        }

        const updated = await adminReviewModel.updateBannedWord({
            id,
            word,
            reason,
            isActive,
            updatedBy: parseActorId(req),
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy từ cấm để cập nhật.' });
        }

        return res.status(200).json({ success: true, message: 'Cập nhật từ cấm thành công.' });
    } catch (error) {
        if (String(error.message || '').includes('UNIQUE')) {
            return res.status(409).json({ success: false, message: 'Từ cấm đã tồn tại.' });
        }
        console.error('Update banned word error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật từ cấm.' });
    }
};

const deleteAdminBannedWord = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) {
            return res.status(400).json({ success: false, message: 'ID từ cấm không hợp lệ.' });
        }

        const deleted = await adminReviewModel.deleteBannedWord(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy từ cấm để xóa.' });
        }

        return res.status(200).json({ success: true, message: 'Xóa từ cấm thành công.' });
    } catch (error) {
        console.error('Delete banned word error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi xóa từ cấm.' });
    }
};

module.exports = {
    getAdminReviews,
    deleteAdminReview,
    getAdminBannedWords,
    createAdminBannedWord,
    updateAdminBannedWord,
    deleteAdminBannedWord,
};
