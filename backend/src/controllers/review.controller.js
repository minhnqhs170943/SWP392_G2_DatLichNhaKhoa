const reviewModel = require('../models/review.model');

const get5LastestReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.get5LastestReviews();
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

const getAppointmentById = async (req, res) => {
    try {
        const { userId } = req.params;
        const appointment = await reviewModel.getAppointmentById(userId);
        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin lịch hẹn thành công',
            data: appointment
        });
    } catch (error) {
        console.error('Get Appointment by ID Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = { get5LastestReviews, getAppointmentById };
