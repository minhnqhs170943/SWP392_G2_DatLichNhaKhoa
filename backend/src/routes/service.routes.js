const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/servies.controller');

router.get('/all', serviceController.getAllServices);

module.exports = router;