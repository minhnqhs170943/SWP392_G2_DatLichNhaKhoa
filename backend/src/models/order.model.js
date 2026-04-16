const { sql } = require('../config/db');

class Order {
    static async create(orderData) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('UserID', sql.Int, orderData.userId)
                .input('AppointmentID', sql.Int, orderData.appointmentId || null)
                .input('TotalAmount', sql.Decimal(18, 2), orderData.totalAmount)
                .input('ShippingAddress', sql.NVarChar(255), orderData.shippingAddress)
                .input('Status', sql.NVarChar(50), orderData.status || 'Pending')
                .query(`
                    INSERT INTO Orders (UserID, AppointmentID, TotalAmount, ShippingAddress, Status, OrderDate)
                    VALUES (@UserID, @AppointmentID, @TotalAmount, @ShippingAddress, @Status, GETDATE());
                    SELECT * FROM Orders WHERE OrderID = SCOPE_IDENTITY();
                `);
            
            const result = await pool.request()
                .input('UserID', sql.Int, orderData.userId)
                .query('SELECT TOP 1 * FROM Orders WHERE UserID = @UserID ORDER BY OrderID DESC');
            
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

    static async updateStatus(orderId, status) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('OrderID', sql.Int, orderId)
                .input('Status', sql.NVarChar(50), status)
                .query(`
                    UPDATE Orders 
                    SET Status = @Status 
                    WHERE OrderID = @OrderID
                `);
            
            const result = await pool.request()
                .input('OrderID', sql.Int, orderId)
                .query('SELECT * FROM Orders WHERE OrderID = @OrderID');
            
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
                .query(`
                    SELECT 
                        o.OrderID,
                        o.UserID,
                        o.AppointmentID,
                        o.TotalAmount,
                        o.ShippingAddress,
                        o.Status,
                        o.OrderDate,
                        ISNULL(i.Status, 'Unpaid') as PaymentStatus,
                        ISNULL(p.PaymentMethod, 'N/A') as PaymentMethod
                    FROM Orders o
                    LEFT JOIN Invoices i ON o.OrderID = i.OrderID
                    LEFT JOIN Payments p ON i.InvoiceID = p.InvoiceID
                    WHERE o.UserID = @UserID 
                    ORDER BY o.OrderDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Order;
