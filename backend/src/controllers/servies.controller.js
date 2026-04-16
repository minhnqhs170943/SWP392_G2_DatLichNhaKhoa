const serviceModel = require('../models/service.model');

const getAllServices = async (req, res) => {
    try {
        const services = await serviceModel.getAllServices();
        res.status(200).json({ success: true, services });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy danh sách dịch vụ" });
    }
};

module.exports = { getAllServices };