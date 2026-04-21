const { sql, connectDB } = require('../config/db');
const cloudinary = require('../config/cloudinary');

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/admin/products
const getProducts = async (req, res) => {
    const { search } = req.query;
    try {
        const pool = await connectDB();
        const request = pool.request();
        let query = `SELECT * FROM Products`;

        if (search && search.trim() !== '') {
            request.input('search', sql.NVarChar, `%${search.trim()}%`);
            query += ` WHERE ProductName LIKE @search OR Brand LIKE @search`;
        }

        query += ` ORDER BY CreatedAt DESC`;

        const result = await request.query(query);
        res.status(200).json({ success: true, payload: result.recordset });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy sản phẩm' });
    }
};

// @desc    Lấy 1 sản phẩm
// @route   GET /api/admin/products/:id
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`SELECT * FROM Products WHERE ProductID = @ProductID`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.status(200).json({ success: true, payload: result.recordset[0] });
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Tạo sản phẩm mới (có ảnh Cloudinary)
// @route   POST /api/admin/products
const createProduct = async (req, res) => {
    const { ProductName, Brand, Description, Price, IsActive } = req.body;

    if (!ProductName || !Price) {
        // Xóa ảnh đã upload nếu validation fail
        if (req.file?.filename) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        return res.status(400).json({ success: false, message: 'Tên sản phẩm và giá là bắt buộc.' });
    }

    const priceNum = parseFloat(Price);
    if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ success: false, message: 'Giá không hợp lệ.' });
    }

    let imageURL = null;
    if (req.file) {
        try {
            const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            const result = await cloudinary.uploader.upload(base64, { folder: "nhakhoa_products", resource_type: "image" });
            imageURL = result.secure_url;
        } catch (uploadObjError) {
            console.error("Cloudinary Upload Error:", uploadObjError);
        }
    }

    const isActiveBit = IsActive === 'true' || IsActive === true ? 1 : 0;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('ProductName', sql.NVarChar, ProductName)
            .input('Brand', sql.NVarChar, Brand || null)
            .input('Description', sql.NVarChar, Description || null)
            .input('Price', sql.Decimal(18, 2), priceNum)
            .input('ImageURL', sql.VarChar, imageURL)
            .input('IsActive', sql.Bit, isActiveBit)
            .query(`
                INSERT INTO Products (ProductName, Brand, Description, Price, ImageURL, IsActive, CreatedAt)
                OUTPUT INSERTED.*
                VALUES (@ProductName, @Brand, @Description, @Price, @ImageURL, @IsActive, GETDATE())
            `);

        res.status(201).json({ success: true, payload: result.recordset[0], message: 'Thêm sản phẩm thành công' });
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo sản phẩm' });
    }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { ProductName, Brand, Description, Price, IsActive } = req.body;

    if (!ProductName || !Price) {
        if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ success: false, message: 'Tên sản phẩm và giá là bắt buộc.' });
    }

    const priceNum = parseFloat(Price);
    if (isNaN(priceNum) || priceNum < 0) {
        if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ success: false, message: 'Giá không hợp lệ.' });
    }

    const isActiveBit = IsActive === 'true' || IsActive === true ? 1 : 0;

    try {
        const pool = await connectDB();

        const checkExist = await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`SELECT ProductID, ImageURL FROM Products WHERE ProductID = @ProductID`);

        if (checkExist.recordset.length === 0) {
            if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        const oldProduct = checkExist.recordset[0];
        let imageURL = oldProduct.ImageURL;

        // Nếu có ảnh mới, upload ảnh mới lên Cloudinary
        if (req.file) {
            try {
                const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
                const uploadResult = await cloudinary.uploader.upload(base64, { folder: "nhakhoa_products", resource_type: "image" });
                
                // Nếu upload thành công thì xóa ảnh cũ
                if (uploadResult && uploadResult.secure_url) {
                    if (oldProduct.ImageURL) {
                        try {
                            const urlParts = oldProduct.ImageURL.split('/');
                            const fileName = urlParts[urlParts.length - 1];
                            const publicId = fileName.split('.')[0];
                            await cloudinary.uploader.destroy(`nhakhoa_products/${publicId}`).catch(() => {});
                        } catch(e) {}
                    }
                    imageURL = uploadResult.secure_url;
                }
            } catch (err) {
                console.error("Cloudinary Update Error", err);
            }
        }

        const result = await pool.request()
            .input('ProductID', sql.Int, id)
            .input('ProductName', sql.NVarChar, ProductName)
            .input('Brand', sql.NVarChar, Brand || null)
            .input('Description', sql.NVarChar, Description || null)
            .input('Price', sql.Decimal(18, 2), priceNum)
            .input('ImageURL', sql.VarChar, imageURL)
            .input('IsActive', sql.Bit, isActiveBit)
            .query(`
                UPDATE Products
                SET ProductName = @ProductName, Brand = @Brand, Description = @Description,
                    Price = @Price, ImageURL = @ImageURL, IsActive = @IsActive
                OUTPUT INSERTED.*
                WHERE ProductID = @ProductID
            `);

        res.status(200).json({ success: true, payload: result.recordset[0], message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        if (req.file?.filename) await cloudinary.uploader.destroy(req.file.filename);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật sản phẩm' });
    }
};

// @desc    Xóa sản phẩm (soft delete)
// @route   DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await connectDB();

        const checkExist = await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`SELECT ProductID FROM Products WHERE ProductID = @ProductID`);

        if (checkExist.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        await pool.request()
            .input('ProductID', sql.Int, id)
            .query(`UPDATE Products SET IsActive = 0 WHERE ProductID = @ProductID`);

        res.status(200).json({ success: true, message: 'Ẩn sản phẩm thành công' });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa sản phẩm' });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
