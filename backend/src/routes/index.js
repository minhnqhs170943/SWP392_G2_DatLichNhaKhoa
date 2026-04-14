const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const paymentRoutes = require('./payment.routes');
const doctorRoutes = require('./doctor.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');

router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

module.exports = router;
