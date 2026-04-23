const express = require('express');
const router = express.Router();
const consultationListController = require('../../controllers/Doctor/consultationList.controller');
const { verifyToken, checkRole} = require('../../middlewares/auth.middleware');

router.get('/services', verifyToken, checkRole([2]), consultationListController.getConsultationServices);
router.get('/:userId', verifyToken, checkRole([2]), consultationListController.getConsultationList);

module.exports = router;