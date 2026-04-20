const express = require('express');
const router = express.Router();
const pendingController = require('../../controllers/Doctor/doctorPending.controller');

router.get('/services', pendingController.getServicesList);
router.get('/:doctorId', pendingController.getPendingList);
router.put('/:appointmentId/status', pendingController.updateStatus);

module.exports = router;