const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const doctorRoutes = require('./doctor.routes');
const productRoutes = require('./product.routes');

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/products', productRoutes);

module.exports = router;
