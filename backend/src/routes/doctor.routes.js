const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');

router.get('/', doctorController.getDoctors);
router.get('/detail/:id', doctorController.getDoctorById);

module.exports = router;
