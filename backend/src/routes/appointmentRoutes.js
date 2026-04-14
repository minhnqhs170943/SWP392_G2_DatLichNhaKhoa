const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// GET all appointments
router.get('/', appointmentController.getAllAppointments);

// PUT update status of an appointment
router.put('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
