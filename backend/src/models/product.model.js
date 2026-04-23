const { sql } = require('../config/db');

const findAllProducts = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            ProductID,
            ProductName,
            Brand,
            Description,
            Price,
            ImageURL,
            IsActive,
            CreatedAt
        FROM [dbo].[Products] 
        WHERE IsActive = 1
        ORDER BY ProductID DESC
    `);
    return result.recordset;
};

const findProductById = async (productId) => {
    const request = new sql.Request();
    request.input('productId', sql.Int, productId);
    const result = await request.query(`
        SELECT 
            ProductID,
            ProductName,
            Brand,
            Description,
            Price,
            ImageURL,
            IsActive,
            CreatedAt 
        FROM [dbo].[Products]
        WHERE ProductID = @productId AND IsActive = 1
    `);
    return result.recordset[0];
};

const findAllProductsForAdmin = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            ProductID,
            ProductName,
            Brand,
            Description,
            Price,
            ImageURL,
            IsActive,
            CreatedAt,
        FROM [dbo].[Products]
        ORDER BY ProductID DESC
    `);
    return result.recordset;
};

const createProduct = async ({ productName, brand, description, price, imageURL }) => {
    const request = new sql.Request();
    request.input('productName', sql.NVarChar(sql.MAX), productName);
    request.input('brand', sql.NVarChar(sql.MAX), brand || null);
    request.input('description', sql.NVarChar(sql.MAX), description || null);
    request.input('price', sql.Decimal(18, 2), price);
    request.input('imageURL', sql.NVarChar(sql.MAX), imageURL || null)

    const result = await request.query(`
        INSERT INTO [dbo].[Products] (ProductName, Brand, Description, Price, ImageURL, IsActive, CreatedAt)
        OUTPUT INSERTED.ProductID
        VALUES (@productName, @brand, @description, @price, @imageURL, 1, GETDATE())
    `);

    return result.recordset[0]?.ProductID;
};

const updateProduct = async (productId, { productName, brand, description, price, imageURL, isActive }) => {
    const request = new sql.Request();
    request.input('productId', sql.Int, productId);
    request.input('productName', sql.NVarChar(sql.MAX), productName);
    request.input('brand', sql.NVarChar(sql.MAX), brand || null);
    request.input('description', sql.NVarChar(sql.MAX), description || null);
    request.input('price', sql.Decimal(18, 2), price);
    request.input('imageURL', sql.NVarChar(sql.MAX), imageURL || null);
    request.input('isActive', sql.Bit, isActive ? 1 : 0);

    const result = await request.query(`
        UPDATE [dbo].[Products]
        SET
            ProductName = @productName,
            Brand = @brand,
            Description = @description,
            Price = @price,
            ImageURL = @imageURL,
            IsActive = @isActive,
        WHERE ProductID = @productId
    `);
    return result.rowsAffected[0] || 0;
};

const softDeleteProduct = async (productId) => {
    const request = new sql.Request();
    request.input('productId', sql.Int, productId);
    const result = await request.query(`
        UPDATE [dbo].[Products]
        SET IsActive = 0
        WHERE ProductID = @productId
    `);
    return result.rowsAffected[0] || 0;
};

module.exports = {
    findAllProducts,
    findProductById,
    findAllProductsForAdmin,
    createProduct,
    updateProduct,
    softDeleteProduct
};
