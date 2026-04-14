const { sql } = require('../config/db');

class OrderDetail {
    static async createBulk(orderDetails) {
        try {
            const pool = await sql.connect();
            const transaction = new sql.Transaction(pool);
            
            await transaction.begin();
            
            try {
                for (const detail of orderDetails) {
                    await transaction.request()
                        .input('OrderID', sql.Int, detail.orderId)
                        .input('ProductID', sql.Int, detail.productId)
                        .input('Quantity', sql.Int, detail.quantity)
                        .input('UnitPrice', sql.Decimal(10, 2), detail.unitPrice)
                        .query(`
                            INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice)
                            VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice)
                        `);
                }
                
                await transaction.commit();
                return true;
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    static async getByOrderId(orderId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('OrderID', sql.Int, orderId)
                .query(`
                    SELECT od.*, p.ProductName, p.ImageURL 
                    FROM OrderDetails od
                    JOIN Products p ON od.ProductID = p.ProductID
                    WHERE od.OrderID = @OrderID
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderDetail;
