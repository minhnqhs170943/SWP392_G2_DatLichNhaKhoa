const { sql } = require('../config/db');

let cartItemTableName = null;

const getCartItemTableName = async () => {
    if (cartItemTableName) return cartItemTableName;

    const request = new sql.Request();
    const result = await request.query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = 'dbo'
          AND TABLE_NAME IN ('CartItem', 'CartItems')
    `);

    const names = result.recordset.map((r) => r.TABLE_NAME);
    if (names.includes('CartItem')) {
        cartItemTableName = 'CartItem';
        return cartItemTableName;
    }
    if (names.includes('CartItems')) {
        cartItemTableName = 'CartItems';
        return cartItemTableName;
    }

    throw new Error("Không tìm thấy bảng CartItem/CartItems trong database");
};

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
    const itemTable = await getCartItemTableName();
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
        FROM [dbo].[${itemTable}] ci
        JOIN [dbo].[Products] p ON ci.ProductID = p.ProductID
        WHERE ci.CartID = @CartId
        ORDER BY ci.CartItemID DESC
    `);
    return result.recordset;
};

const addItemToCart = async (userId, productId, quantity = 1) => {
    const itemTable = await getCartItemTableName();
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    request.input('ProductId', sql.Int, productId);
    request.input('Quantity', sql.Int, quantity);

    await request.query(`
        IF EXISTS (
            SELECT 1
            FROM [dbo].[${itemTable}]
            WHERE CartID = @CartId AND ProductID = @ProductId
        )
        BEGIN
            UPDATE [dbo].[${itemTable}]
            SET Quantity = Quantity + @Quantity
            WHERE CartID = @CartId AND ProductID = @ProductId
        END
        ELSE
        BEGIN
            INSERT INTO [dbo].[${itemTable}] (CartID, ProductID, Quantity)
            VALUES (@CartId, @ProductId, @Quantity)
        END
    `);

    return findCartItems(userId);
};

const updateCartItemQuantity = async (userId, productId, quantity) => {
    const itemTable = await getCartItemTableName();
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    request.input('ProductId', sql.Int, productId);
    request.input('Quantity', sql.Int, quantity);

    if (quantity <= 0) {
        await request.query(`
            DELETE FROM [dbo].[${itemTable}]
            WHERE CartID = @CartId AND ProductID = @ProductId
        `);
    } else {
        await request.query(`
            UPDATE [dbo].[${itemTable}]
            SET Quantity = @Quantity
            WHERE CartID = @CartId AND ProductID = @ProductId
        `);
    }

    return findCartItems(userId);
};

const removeCartItem = async (userId, productId) => {
    const itemTable = await getCartItemTableName();
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);
    request.input('ProductId', sql.Int, productId);

    await request.query(`
        DELETE FROM [dbo].[${itemTable}]
        WHERE CartID = @CartId AND ProductID = @ProductId
    `);

    return findCartItems(userId);
};

const clearCartItems = async (userId) => {
    const itemTable = await getCartItemTableName();
    const cartId = await getOrCreateCartId(userId);
    const request = new sql.Request();
    request.input('CartId', sql.Int, cartId);

    await request.query(`
        DELETE FROM [dbo].[${itemTable}]
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
