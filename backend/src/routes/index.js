const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const paymentRoutes = require('./payment.routes');
const doctorRoutes = require('./doctor.routes');
const productRoutes = require('./product.routes');
const serviceRoutes = require('./service.routes');
const cartRoutes = require('./cart.routes');
const uploadRoutes = require("./upload.routes");
const reviewRoutes = require('./review.routes');
const dashboardRoutes = require('./dashboardRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const blogRoutes = require('./blog.routes');

router.use("/upload", uploadRoutes);
router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/cart', cartRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/blogs', blogRoutes);

module.exports = router;
