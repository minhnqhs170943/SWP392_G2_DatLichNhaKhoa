const productModel = require('../models/product.model');

const getProducts = async (req, res) => {
    try {
        const products = await productModel.findAllProducts();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm thành công',
            data: products
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productModel.findProductById(parseInt(id, 10));
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Get Product Detail Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = { getProducts, getProductById };
