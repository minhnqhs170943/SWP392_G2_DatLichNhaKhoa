const doctorModel = require('../models/doctor.model');

const getDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.findAllDoctors();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách bác sĩ thành công',
            data: doctors
        });
    } catch (error) {
        console.error('Get Doctors Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getAvailableDoctors = async (req, res) => {
    try {
        const { date, time } = req.query;
        if (!date || !time) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp date và time' });
        }
        const doctors = await doctorModel.findAvailableDoctors(date, time);
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách bác sĩ rảnh thành công',
            data: doctors
        });
    } catch (error) {
        console.error('Get Available Doctors Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getBookedSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp date (YYYY-MM-DD)' });
        }
        const bookedSlots = await doctorModel.findBookedSlots(date);
        return res.status(200).json({
            success: true,
            data: bookedSlots
        });
    } catch (error) {
        console.error('Get Booked Slots Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getDoctorById = async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await doctorModel.findDoctorById(parseInt(id, 10));
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bác sĩ' });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin bác sĩ thành công',
            data: doctor
        });
    } catch (error) {
        console.error('Get Doctor Detail Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getServices = async (req, res) => {
    try {
        const services = await doctorModel.getAllServices();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách bác sĩ thành công',
            data: services
        });
    } catch (error) {
        console.error('Get Doctors Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = { getDoctors, getAvailableDoctors, getBookedSlots, getDoctorById, getServices };
