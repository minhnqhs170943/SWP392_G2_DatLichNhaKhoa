const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/Doctor/doctorProfile.controller');
const { verifyToken, checkRole } = require('../../middlewares/auth.middleware');

// Lấy thông tin hồ sơ
router.get('/:userId', verifyToken, checkRole([2]), profileController.getProfile);
// Cập nhật hồ sơ (bao gồm cả upload avatar nếu cần)
router.put('/update', verifyToken, checkRole([2]), profileController.updateProfile);
router.put('/change-password', verifyToken, checkRole([2]), profileController.changePassword);

module.exports = router;