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

const getProductsForAdmin = async (req, res) => {
    try {
        const products = await productModel.findAllProductsForAdmin();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm admin thành công',
            data: products
        });
    } catch (error) {
        console.error('Get Admin Products Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { productName, brand, description, price, stockQuantity, imageURL } = req.body;
        if (!productName || price === undefined || stockQuantity === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc' });
        }

        const productId = await productModel.createProduct({
            productName: String(productName).trim(),
            brand: brand ? String(brand).trim() : null,
            description: description ? String(description).trim() : null,
            price: Number(price),
            stockQuantity: Number(stockQuantity),
            imageURL: imageURL ? String(imageURL).trim() : null
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: { productId }
        });
    } catch (error) {
        console.error('Create Product Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, brand, description, price, stockQuantity, imageURL, isActive } = req.body;
        if (!productName || price === undefined || stockQuantity === undefined) {
            return res.status(400).json({ success: false, message: 'Thiếu dữ liệu bắt buộc' });
        }

        const affected = await productModel.updateProduct(Number(id), {
            productName: String(productName).trim(),
            brand: brand ? String(brand).trim() : null,
            description: description ? String(description).trim() : null,
            price: Number(price),
            stockQuantity: Number(stockQuantity),
            imageURL: imageURL ? String(imageURL).trim() : null,
            isActive: isActive !== false
        });

        if (!affected) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        return res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error('Update Product Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const affected = await productModel.softDeleteProduct(Number(id));
        if (!affected) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        return res.status(200).json({ success: true, message: 'Ẩn sản phẩm thành công' });
    } catch (error) {
        console.error('Delete Product Error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductsForAdmin,
    createProduct,
    updateProduct,
    deleteProduct
};
