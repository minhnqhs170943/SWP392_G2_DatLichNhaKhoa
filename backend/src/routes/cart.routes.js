const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

router.get('/:userId', cartController.getCartItems);
router.post('/:userId/items', cartController.addCartItem);
router.patch('/:userId/items/:productId', cartController.updateCartItem);
router.delete('/:userId/items/:productId', cartController.removeCartItem);
router.delete('/:userId/clear', cartController.clearCart);

module.exports = router;
