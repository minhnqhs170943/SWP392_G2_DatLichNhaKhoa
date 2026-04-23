const dashboardModel = require('../../models/Doctor/doctorDashboard.model');

const getFullDashboard = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { filterMode = 'date', startDate, endDate } = req.query;

        if (parseInt(userId) !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem dữ liệu của người khác' });
        }

        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu ID bác sĩ' });
        if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Thiếu khoảng thời gian' });

        const metrics = await dashboardModel.getMetrics(userId, startDate, endDate);
        const combo = await dashboardModel.getComboChartData(userId, filterMode, startDate, endDate);
        const status = await dashboardModel.getStatusDistribution(userId, startDate, endDate);
        const topServices = await dashboardModel.getTopServices(userId, startDate, endDate);
        const appointments = await dashboardModel.getAppointmentLists(userId, startDate, endDate);

        res.status(200).json({ success: true, metrics, combo, status, topServices, appointments });
    } catch (error) {
        next(error);
    }
};

const handleStatusUpdate = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { status, cancelReason } = req.body;
        const userId = req.user.userId;

        if (!status) return res.status(400).json({ success: false, message: 'Thiếu trạng thái cần cập nhật' });

        if (status === 'Cancelled' && (!cancelReason || cancelReason.trim() === '')) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do hủy lịch hẹn' });
        }

        const success = await dashboardModel.updateStatus(appointmentId, status, userId, cancelReason);
        if (!success) return res.status(404).json({ success: false, message: 'Thao tác thất bại hoặc lịch hẹn không thuộc về bạn' });

        res.status(200).json({ success: true, message: 'Cập nhật trạng thái lịch hẹn thành công' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getFullDashboard, handleStatusUpdate };