const { sql } = require('../config/db');

class Order {
    static async create(orderData) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('UserID', sql.Int, orderData.userId)
                .input('TotalAmount', sql.Decimal(10, 2), orderData.totalAmount)
                .input('PaymentMethod', sql.VarChar(50), orderData.paymentMethod)
                .input('PaymentStatus', sql.VarChar(50), orderData.paymentStatus || 'PENDING')
                .input('ShippingAddress', sql.NVarChar(255), orderData.shippingAddress)
                .input('OrderDate', sql.DateTime, new Date())
                .query(`
                    INSERT INTO Orders (UserID, TotalAmount, PaymentMethod, PaymentStatus, ShippingAddress, OrderDate)
                    OUTPUT INSERTED.*
                    VALUES (@UserID, @TotalAmount, @PaymentMethod, @PaymentStatus, @ShippingAddress, @OrderDate)
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findById(orderId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('OrderID', sql.Int, orderId)
                .query('SELECT * FROM Orders WHERE OrderID = @OrderID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async updatePaymentStatus(orderId, status) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('OrderID', sql.Int, orderId)
                .input('PaymentStatus', sql.VarChar(50), status)
                .query(`
                    UPDATE Orders 
                    SET PaymentStatus = @PaymentStatus 
                    WHERE OrderID = @OrderID
                    OUTPUT INSERTED.*
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async getOrdersByUser(userId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('UserID', sql.Int, userId)
                .query('SELECT * FROM Orders WHERE UserID = @UserID ORDER BY OrderDate DESC');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Order;
