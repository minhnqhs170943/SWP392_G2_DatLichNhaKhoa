const express = require('express');
const router = express.Router();
 
const serviceController = require('../controllers/doctor.controller');


router.get('/', serviceController.getServices)

module.exports = router;
 
