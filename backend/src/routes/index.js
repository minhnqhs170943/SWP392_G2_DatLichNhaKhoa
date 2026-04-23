const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const paymentRoutes = require('./payment.routes');
const doctorRoutes = require('./doctor.routes');
const productRoutesFile = require('./product.routes');
const adminProductRoutes = require('./productRoutes');
const serviceRoutes = require('./service.routes');
const cartRoutes = require('./cart.routes');
const uploadRoutes = require("./upload.routes");
const reviewRoutes = require('./review.routes');
const dashboardRoutes = require('./dashboardRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const blogRoutes = require('./blog.routes');
const notificationRoutes = require('./notification.routes');
const doctorDashboard = require('../routes/Doctor/doctorDashboard.routes');
const doctorPending = require('../routes/Doctor/doctorPending.routes');
const consultationList = require('../routes/Doctor/consultationList.routes');
const consultationDetail = require('../routes/Doctor/consultationDetail.routes');
const consultationHistory = require('../routes/Doctor/consultationHistory.routes');
const doctorProfileRoutes = require('../routes/Doctor/doctorProfile.routes');

router.use("/upload", uploadRoutes);
router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/products', productRoutesFile);
router.use('/admin/products', adminProductRoutes);
router.use('/services', serviceRoutes);
router.use('/cart', cartRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/blogs', blogRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin/analytics', require('./adminStatsRoutes'));
router.use('/admin/users', require('./adminUserRoutes'));
router.use('/admin/invoices', require('./adminInvoiceRoutes'));
router.use('/admin/reviews', require('./adminReviewRoutes'));

// Doctor
router.use('/doctor-dashboard', doctorDashboard);
router.use('/doctor-pending', doctorPending);
router.use('/consultation-list', consultationList);
router.use('/consultation-detail', consultationDetail);
router.use('/consultation-history', consultationHistory);
router.use('/doctor-profile', doctorProfileRoutes);

module.exports = router;
