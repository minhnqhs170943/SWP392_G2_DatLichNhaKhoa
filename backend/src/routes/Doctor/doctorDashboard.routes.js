const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/Doctor/doctorDashboard.controller');
const { verifyToken, checkRole } = require('../../middlewares/auth.middleware');

router.get('/:userId', verifyToken, checkRole([2]), dashboardController.getFullDashboard);
router.put('/status/:appointmentId', verifyToken, checkRole([2]), dashboardController.handleStatusUpdate);

module.exports = router;