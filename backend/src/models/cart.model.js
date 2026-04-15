const { sql } = require('../config/db');

const getOrCreateCartId = async (userId) => {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);

    const findResult = await request.query(`
        SELECT TOP 1 CartID
        FROM [dbo].[Cart]
        WHERE UserID = @UserId
        ORDER BY CartID DESC
    `);

    if (findResult.recordset.length > 0) {
        return findResult.recordset[0].CartID;
    }

    const createRequest = new sql.Request();
    createRequest.input('UserId', sql.Int, userId);
    const createResult = await createRequest.query(`
        INSERT INTO [dbo].[Cart] (UserID, CreatedAt)
        OUTPUT INSERTED.CartID
        VALUES (@UserId, GETDATE())
    `);

    return createResult.recordset[0].CartID;
};

const findCartItems = async (userId) => {
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    const result = await request.query(`
        SELECT
            ci.CartItemID,
            ci.CartID,
            ci.ProductID,
            ci.Quantity,
            p.ProductName,
            p.Brand,
            p.Price,
            p.ImageURL
        FROM [dbo].[CartItems] ci
        JOIN [dbo].[Products] p ON ci.ProductID = p.ProductID
        WHERE ci.CartID = @CartId
        ORDER BY ci.CartItemID DESC
    `);
    return result.recordset;
};

const addItemToCart = async (userId, productId, quantity = 1) => {
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    request.input('ProductId', sql.Int, productId);
    request.input('Quantity', sql.Int, quantity);

    await request.query(`
        IF EXISTS (
            SELECT 1
            FROM [dbo].[CartItems]
            WHERE CartID = @CartId AND ProductID = @ProductId
        )
        BEGIN
            UPDATE [dbo].[CartItems]
            SET Quantity = Quantity + @Quantity
            WHERE CartID = @CartId AND ProductID = @ProductId
        END
        ELSE
        BEGIN
            INSERT INTO [dbo].[CartItems] (CartID, ProductID, Quantity)
            VALUES (@CartId, @ProductId, @Quantity)
        END
    `);

    return findCartItems(userId);
};

const updateCartItemQuantity = async (userId, productId, quantity) => {
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    request.input('ProductId', sql.Int, productId);
    request.input('Quantity', sql.Int, quantity);

    if (quantity <= 0) {
        await request.query(`
            DELETE FROM [dbo].[CartItems]
            WHERE CartID = @CartId AND ProductID = @ProductId
        `);
    } else {
        await request.query(`
            UPDATE [dbo].[CartItems]
            SET Quantity = @Quantity
            WHERE CartID = @CartId AND ProductID = @ProductId
        `);
    }

    return findCartItems(userId);
};

const removeCartItem = async (userId, productId) => {
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    request.input('ProductId', sql.Int, productId);

    await request.query(`
        DELETE FROM [dbo].[CartItems]
        WHERE CartID = @CartId AND ProductID = @ProductId
    `);

    return findCartItems(userId);
};

const clearCartItems = async (userId) => {
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);

    await request.query(`
        DELETE FROM [dbo].[CartItems]
        WHERE CartID = @CartId
    `);
};

module.exports = {
    findCartItems,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCartItems
};
