const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', blogController.getBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/:id', blogController.getBlogById);

// Admin routes
router.get('/admin/all', verifyToken, checkRole([1]), blogController.getBlogsForAdmin);
router.post('/', verifyToken, checkRole([1]), blogController.createBlog);
router.put('/:id', verifyToken, checkRole([1]), blogController.updateBlog);
router.delete('/:id', verifyToken, checkRole([1]), blogController.deleteBlog);

module.exports = router;
