const cartModel = require('../models/cart.model');

const getCartItems = async (req, res) => {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId, 10);
    if (Number.isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }
    try {
        const cartItems = await cartModel.findCartItems(parsedUserId);
        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin giỏ hàng thành công',
            data: cartItems
        });
    } catch (error) {
        console.error('Get Cart Items Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống' });
    }
};

const addCartItem = async (req, res) => {
    const { userId } = req.params;
    const { productId, quantity } = req.body;
    const parsedUserId = parseInt(userId, 10);
    const parsedProductId = parseInt(productId, 10);
    const parsedQuantity = parseInt(quantity || 1, 10);

    if (Number.isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }

    if (!productId) {
        return res.status(400).json({ success: false, message: 'Thiếu productId' });
    }
    if (Number.isNaN(parsedProductId)) {
        return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
    }
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({ success: false, message: 'quantity không hợp lệ' });
    }

    try {
        const nextItems = await cartModel.addItemToCart(
            parsedUserId,
            parsedProductId,
            parsedQuantity
        );

        return res.status(200).json({
            success: true,
            message: 'Thêm sản phẩm vào giỏ hàng thành công',
            data: nextItems
        });
    } catch (error) {
        console.error('Add Cart Item Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống' });
    }
};

const updateCartItem = async (req, res) => {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    const parsedUserId = parseInt(userId, 10);
    const parsedProductId = parseInt(productId, 10);
    const parsedQuantity = parseInt(quantity, 10);

    if (Number.isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }
    if (Number.isNaN(parsedProductId)) {
        return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
    }

    if (quantity === undefined || quantity === null) {
        return res.status(400).json({ success: false, message: 'Thiếu quantity' });
    }
    if (Number.isNaN(parsedQuantity)) {
        return res.status(400).json({ success: false, message: 'quantity không hợp lệ' });
    }

    try {
        const nextItems = await cartModel.updateCartItemQuantity(
            parsedUserId,
            parsedProductId,
            parsedQuantity
        );

        return res.status(200).json({
            success: true,
            message: 'Cập nhật giỏ hàng thành công',
            data: nextItems
        });
    } catch (error) {
        console.error('Update Cart Item Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống' });
    }
};

const removeCartItem = async (req, res) => {
    const { userId, productId } = req.params;
    const parsedUserId = parseInt(userId, 10);
    const parsedProductId = parseInt(productId, 10);
    if (Number.isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }
    if (Number.isNaN(parsedProductId)) {
        return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
    }
    try {
        const nextItems = await cartModel.removeCartItem(
            parsedUserId,
            parsedProductId
        );
        return res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
            data: nextItems
        });
    } catch (error) {
        console.error('Remove Cart Item Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống' });
    }
};

const clearCart = async (req, res) => {
    const { userId } = req.params;
    const parsedUserId = parseInt(userId, 10);
    if (Number.isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: 'userId không hợp lệ' });
    }
    try {
        await cartModel.clearCartItems(parsedUserId);
        return res.status(200).json({
            success: true,
            message: 'Xóa toàn bộ giỏ hàng thành công',
            data: []
        });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Lỗi hệ thống' });
    }
};

module.exports = { getCartItems, addCartItem, updateCartItem, removeCartItem, clearCart };

