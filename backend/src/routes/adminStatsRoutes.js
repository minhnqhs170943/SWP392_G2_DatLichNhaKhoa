const express = require('express');
const router = express.Router();
const AdminStatsController = require('../controllers/adminStatsController');

// Define route for comprehensive admin analytics
router.get('/overview', AdminStatsController.getComprehensiveAnalytics);

module.exports = router;
