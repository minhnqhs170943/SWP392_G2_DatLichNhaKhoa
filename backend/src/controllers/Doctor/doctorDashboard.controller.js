const dashboardModel = require('../../models/Doctor/doctorDashboard.model');

const getFullDashboard = async (req, res) => {
    try {
        const { doctorId: userId } = req.params;
        const { filterMode = 'date', startDate, endDate } = req.query;

        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu ID bác sĩ' });
        if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Thiếu khoảng thời gian' });

        const metrics = await dashboardModel.getMetrics(userId, startDate, endDate);
        const combo = await dashboardModel.getComboChartData(userId, filterMode, startDate, endDate);
        const status = await dashboardModel.getStatusDistribution(userId, startDate, endDate);
        const topServices = await dashboardModel.getTopServices(userId, startDate, endDate);
        const appointments = await dashboardModel.getAppointmentLists(userId, startDate, endDate);

        res.status(200).json({ success: true, metrics, combo, status, topServices, appointments });
    } catch (error) {
        console.error('Lỗi dashboard:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
    }
};

const handleStatusUpdate = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, note, doctorId: userId } = req.body; 

        const success = await dashboardModel.updateStatus(appointmentId, status, note, userId);
        if (!success) return res.status(404).json({ success: false, message: 'Thao tác thất bại' });

        res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = { getFullDashboard, handleStatusUpdate };