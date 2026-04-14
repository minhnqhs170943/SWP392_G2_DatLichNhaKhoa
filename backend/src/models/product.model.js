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
            StockQuantity,
            ImageURL,
            IsActive
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
            StockQuantity,
            ImageURL,
            IsActive
        FROM [dbo].[Products]
        WHERE ProductID = @productId AND IsActive = 1
    `);
    return result.recordset[0];
};

module.exports = { findAllProducts, findProductById };
