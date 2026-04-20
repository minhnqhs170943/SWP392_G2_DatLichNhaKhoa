const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// @route   GET /api/admin/products
router.get('/', getProducts);

// @route   GET /api/admin/products/:id
router.get('/:id', getProductById);

// @route   POST /api/admin/products  (multipart/form-data, field: image)
router.post('/', upload.single('image'), createProduct);

// @route   PUT /api/admin/products/:id  (multipart/form-data, field: image)
router.put('/:id', upload.single('image'), updateProduct);

// @route   DELETE /api/admin/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
