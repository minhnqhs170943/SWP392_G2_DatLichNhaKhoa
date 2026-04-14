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

module.exports = { getDoctors, getDoctorById };
