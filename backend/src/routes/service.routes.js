const express = require('express');
const router = express.Router();
 
const serviceController = require('../controllers/servies.controller');

router.get('/', serviceController.getAllServices);

module.exports = router;
 
