const express = require('express');
const router = express.Router();
const consultationHistoryController = require('../../controllers/Doctor/consultationHistory.controller');
const { verifyToken, checkRole } = require('../../middlewares/auth.middleware');

router.get('/statuses', verifyToken, checkRole([2]), consultationHistoryController.getCompletedAndCancelledStatuses);
router.get('/:userId', verifyToken, checkRole([2]), consultationHistoryController.getConsultationHistory);
router.get('/detail/:appointmentId', verifyToken, checkRole([2]), consultationHistoryController.getConsultationHistoryDetail);

module.exports = router;