const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// ========= STAFF APIs =========
// GET all appointments (Staff management)
router.get('/', appointmentController.getAllAppointments);

// PUT update status of an appointment
router.put('/:id/status', appointmentController.updateAppointmentStatus);

// PUT xác nhận lịch hẹn (Staff confirm + assign bác sĩ)
router.put('/:id/confirm', appointmentController.confirmAppointment);

// POST thanh toán appointment → auto xác nhận
router.post('/:id/pay', appointmentController.payAppointment);

// GET single appointment detail
router.get('/detail/:id', appointmentController.getAppointmentDetail);

// ========= CUSTOMER APIs =========
// POST create new appointment (customer booking)
router.post('/create', appointmentController.createAppointment);

// GET customer's appointment history
router.get('/my/:userId', appointmentController.getMyAppointments);

module.exports = router;
