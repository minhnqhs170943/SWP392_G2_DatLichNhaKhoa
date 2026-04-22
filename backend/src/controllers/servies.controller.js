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

const createService = async (req, res) => {
    try {
        const { serviceName, description, price } = req.body;
        if (!serviceName || price == null) return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
        const newService = await serviceModel.createService(serviceName, description, price);
        res.status(201).json({ success: true, message: "Tạo dịch vụ thành công", data: newService });
    } catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceName, description, price, isActive } = req.body;
        await serviceModel.updateService(id, serviceName, description, price, isActive);
        res.status(200).json({ success: true, message: "Cập nhật dịch vụ thành công" });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await serviceModel.deleteService(id);
        res.status(200).json({ success: true, message: "Xóa dịch vụ thành công" });
    } catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

module.exports = { getAllServices, createService, updateService, deleteService };