const reviewModel = require('../models/review.model');

const getLatestReviews = async (req, res) => {
    try { 
        const reviews = await reviewModel.getLatestReviews( );
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách đánh giá mới nhất thành công',
            data: reviews
        });
    } catch (error) {
        console.error('Get Latest Reviews Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getEligibleAppointments = async (req, res) => {
    try {
        const { userId } = req.params;
        const parsedUserId = parseInt(userId, 10);
        if (!parsedUserId) {
            return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
        }

        const appointments = await reviewModel.getEligibleAppointmentsByUserId(parsedUserId);
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách lịch hẹn có thể đánh giá thành công',
            data: appointments
        });
    } catch (error) {
        console.error('Get Eligible Appointments Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const createReview = async (req, res) => {
    try {
        const { appointmentId, userId, rating, comment } = req.body;
        const parsedAppointmentId = parseInt(appointmentId, 10);
        const parsedUserId = parseInt(userId, 10);
        const parsedRating = parseInt(rating, 10);

        if (!parsedAppointmentId || !parsedUserId) {
            return res.status(400).json({ success: false, message: 'appointmentId hoặc userId không hợp lệ' });
        }
        if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating phải từ 1 đến 5' });
        }

        const created = await reviewModel.createReview({
            appointmentId: parsedAppointmentId,
            userId: parsedUserId,
            rating: parsedRating,
            comment
        });

        if (!created) {
            return res.status(409).json({
                success: false,
                message: 'Không thể tạo review. Lịch hẹn chưa hoàn thành, không thuộc người dùng, hoặc đã được đánh giá.'
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Tạo đánh giá thành công'
        });
    } catch (error) {
        console.error('Create Review Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const updateReview = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { userId, rating, comment } = req.body;
        const parsedAppointmentId = parseInt(appointmentId, 10);
        const parsedUserId = parseInt(userId, 10);
        const parsedRating = parseInt(rating, 10);

        if (!parsedAppointmentId || !parsedUserId) {
            return res.status(400).json({ success: false, message: 'appointmentId hoặc userId không hợp lệ' });
        }
        if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating phải từ 1 đến 5' });
        }

        const updated = await reviewModel.updateReviewByAppointment({
            appointmentId: parsedAppointmentId,
            userId: parsedUserId,
            rating: parsedRating,
            comment
        });

        if (!updated) {
            return res.status(409).json({
                success: false,
                message: 'Không thể cập nhật review. Có thể bạn đã dùng hết 1 lần chỉnh sửa hoặc không có quyền.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật đánh giá thành công'
        });
    } catch (error) {
        console.error('Update Review Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    getLatestReviews,
    getEligibleAppointments,
    createReview,
    updateReview
};
