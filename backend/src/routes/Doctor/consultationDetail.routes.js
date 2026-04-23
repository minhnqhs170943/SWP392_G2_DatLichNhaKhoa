const express = require('express');
const router = express.Router();
const consultationDetailController = require('../../controllers/Doctor/consultationDetail.controller');
const { verifyToken, checkRole } = require('../../middlewares/auth.middleware');

router.get('/products/all', verifyToken, checkRole([2]), consultationDetailController.getProducts);
router.get('/:appointmentId', verifyToken, checkRole([2]), consultationDetailController.getConsultationDetail);
router.post('/complete', verifyToken, checkRole([2]), consultationDetailController.completeConsultation);

module.exports = router;