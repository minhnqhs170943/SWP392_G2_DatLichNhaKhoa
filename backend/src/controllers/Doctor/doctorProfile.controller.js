const profileModel = require('../../models/Doctor/doctorProfile.model');
const bcrypt = require('bcrypt');

const getProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        // Bảo mật: Chỉ cho phép bác sĩ xem hồ sơ của chính mình
        if (parseInt(userId) !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        const profile = await profileModel.getDoctorProfile(userId);
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const updateData = req.body; 
        
        const success = await profileModel.updateDoctorProfile(userId, updateData);
        if (success) {
            res.status(200).json({ success: true, message: 'Cập nhật hồ sơ thành công' });
        } else {
            res.status(400).json({ success: false, message: 'Cập nhật thất bại' });
        }
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        // Lấy userId trực tiếp từ Token để đảm bảo bảo mật tuyệt đối
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mới' });
        }

        // 1. Lấy mật khẩu hiện tại trong DB
        const currentHashedPassword = await profileModel.getDoctorPassword(userId);
        if (!currentHashedPassword) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
        }

        // 2. So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, field: 'oldPassword', message: 'Mật khẩu hiện tại không đúng' });
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Lưu vào Database
        const isSuccess = await profileModel.updateDoctorPassword(userId, hashedNewPassword);
        if (isSuccess) {
            res.status(200).json({ success: true, message: 'Cập nhật mật khẩu thành công' });
        } else {
            res.status(400).json({ success: false, message: 'Cập nhật mật khẩu thất bại' });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile, changePassword };