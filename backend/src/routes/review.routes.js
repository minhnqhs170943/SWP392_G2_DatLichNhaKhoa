const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

router.get('/', reviewController.getLatestReviews);
router.get('/eligible/:userId', reviewController.getEligibleAppointments);
router.post('/', reviewController.createReview);
router.put('/:appointmentId', reviewController.updateReview);

module.exports = router;
