const express = require('express');
const router = express.Router();
const adminReviewController = require('../controllers/adminReview.controller');

router.get('/', adminReviewController.getAdminReviews);
router.delete('/:id', adminReviewController.deleteAdminReview);

module.exports = router;
