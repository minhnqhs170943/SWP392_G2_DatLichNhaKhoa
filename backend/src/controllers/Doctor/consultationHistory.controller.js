const consultationHistoryModel = require('../../models/Doctor/consultationHistory.model');

const getConsultationHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { search, startDate, endDate, status, page = 1, limit = 10 } = req.query;

        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu ID bác sĩ' });

        if (parseInt(userId) !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem dữ liệu này' });
        }

        const result = await consultationHistoryModel.getConsultationHistory(userId, search, startDate, endDate, status, page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const getCompletedAndCancelledStatuses = async (req, res, next) => {
    try {
        const statuses = await consultationHistoryModel.getCompletedAndCancelledStatuses();
        res.status(200).json({ success: true, data: statuses });
    } catch (error) {
        next(error);
    }
};

const getConsultationHistoryDetail = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.userId;
        
        if (!appointmentId) return res.status(400).json({ success: false, message: 'Thiếu ID lịch khám' });

        const detail = await consultationHistoryModel.getHistoryDetail(appointmentId, userId);
        res.status(200).json({ success: true, data: detail });
    } catch (error) {
        next(error);
    }
};

module.exports = { getConsultationHistory, getCompletedAndCancelledStatuses, getConsultationHistoryDetail };