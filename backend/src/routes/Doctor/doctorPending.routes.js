const express = require('express');
const router = express.Router();
const pendingController = require('../../controllers/Doctor/doctorPending.controller');
const { verifyToken, checkRole } = require('../../middlewares/auth.middleware');

router.get('/services', verifyToken, checkRole([2]), pendingController.getServicesList);
router.get('/:userId', verifyToken, checkRole([2]), pendingController.getPendingList);
router.put('/:appointmentId/status', verifyToken, checkRole([2]), pendingController.updateStatus);

module.exports = router;