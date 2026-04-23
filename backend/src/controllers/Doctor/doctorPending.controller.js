const pendingModel = require('../../models/Doctor/doctorPending.model');

const getServicesList = async (req, res, next) => {
    try {
        const services = await pendingModel.getAllServicesList();
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        next(error);
    }
};

const getPendingList = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { search = '', startDate = '', endDate = '', service = '', page = 1, limit = 10 } = req.query;

        if (parseInt(userId) !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem dữ liệu này' });
        }

        const result = await pendingModel.getPendingAppointments(userId, search, startDate, endDate, service, page, limit);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { status, cancelReason } = req.body;
        const userId = req.user.userId;

        if (status === 'Cancelled' && (!cancelReason || cancelReason.trim() === '')) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do từ chối lịch hẹn' });
        }

        const isSuccess = await pendingModel.updateAppointmentStatus(appointmentId, status, cancelReason, userId);
        
        if (isSuccess) {
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy lịch khám hoặc bạn không có quyền' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getPendingList, getServicesList, updateStatus };