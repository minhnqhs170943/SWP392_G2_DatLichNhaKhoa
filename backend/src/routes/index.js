const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const paymentRoutes = require('./payment.routes');
const doctorRoutes = require('./doctor.routes');
const productRoutes = require('./product.routes');
const serviceRoutes = require('./service.routes');

router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);

module.exports = router;
