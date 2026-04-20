const pendingModel = require('../../models/Doctor/doctorPending.model');

const getServicesList = async (req, res) => {
    try {
        const services = await pendingModel.getAllServicesList();
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        console.error('Lỗi lấy dịch vụ:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách dịch vụ' });
    }
};

const getPendingList = async (req, res) => {
    try {
        const { doctorId: userId } = req.params;
        const { search = '', startDate = '', endDate = '', service = '', page = 1, limit = 5 } = req.query; 
        
        if (!userId) return res.status(400).json({ success: false, message: 'Thiếu ID bác sĩ' });

        const result = await pendingModel.getPendingAppointments(userId, search, startDate, endDate, service, page, limit);
        res.status(200).json({ success: true, ...result }); 
    } catch (error) {
        console.error('Lỗi lấy danh sách lịch chờ duyệt:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status, note, doctorId } = req.body;

        const isSuccess = await pendingModel.updateAppointmentStatus(appointmentId, status, note, doctorId);
        
        if (isSuccess) {
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy lịch khám' });
        }
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = { getPendingList, getServicesList, updateStatus };