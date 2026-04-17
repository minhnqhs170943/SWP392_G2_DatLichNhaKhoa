const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

router.get('/', reviewController.get5LastestReviews);
router.get('/appointment/:userId', reviewController.getAppointmentById);

module.exports = router;
