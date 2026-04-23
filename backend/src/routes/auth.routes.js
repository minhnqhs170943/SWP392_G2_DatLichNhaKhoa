const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/profile/:id', verifyToken, authController.getProfile);
router.put('/profile/:id', verifyToken, authController.updateProfileById);
router.put('/change-password/:id', verifyToken, authController.changePassword);
router.put('/profile/:id/avatar', verifyToken, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
