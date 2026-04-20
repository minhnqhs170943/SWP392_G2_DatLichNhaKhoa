const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/Doctor/doctorDashboard.controller');

router.get('/:doctorId', dashboardController.getFullDashboard);
router.put('/status/:appointmentId', dashboardController.handleStatusUpdate);

module.exports = router;