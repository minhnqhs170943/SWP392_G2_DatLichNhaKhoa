const express = require('express');
const router = express.Router();
const { getAllInvoices } = require('../controllers/adminInvoiceController');

router.get('/', getAllInvoices);

module.exports = router;
