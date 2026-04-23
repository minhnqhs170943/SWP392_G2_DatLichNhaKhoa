const express = require('express');
const router = express.Router();
const adminReviewController = require('../controllers/adminReview.controller');

router.get('/', adminReviewController.getAdminReviews);
router.delete('/:id', adminReviewController.deleteAdminReview);

router.get('/banned-words', adminReviewController.getAdminBannedWords);
router.post('/banned-words', adminReviewController.createAdminBannedWord);
router.put('/banned-words/:id', adminReviewController.updateAdminBannedWord);
router.delete('/banned-words/:id', adminReviewController.deleteAdminBannedWord);

module.exports = router;

