const consultationListModel = require('../../models/Doctor/consultationList.model');

const getConsultationList = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { search, startDate, endDate, service, page = 1, limit = 10 } = req.query;

        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu ID bác sĩ' });

        if (parseInt(userId) !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem dữ liệu này' });
        }

        const servicesList = await consultationListModel.getAllServicesList();
        const result = await consultationListModel.getApprovedAppointments(userId, search, startDate, endDate, service, page, limit);

        res.status(200).json({ success: true, services: servicesList, ...result });
    } catch (error) {
        next(error);
    }
};

const getConsultationServices = async (req, res, next) => {
    try {
        const servicesList = await consultationListModel.getAllServicesList();
        res.status(200).json({ success: true, data: servicesList });
    } catch (error) {
        next(error);
    }
};

module.exports = { getConsultationList, getConsultationServices };