const { sql } = require('../config/db');

class Payment {
    static async create(paymentData) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('OrderID', sql.Int, paymentData.orderId)
                .input('TransactionID', sql.VarChar(255), paymentData.transactionId)
                .input('Amount', sql.Decimal(10, 2), paymentData.amount)
                .input('PaymentMethod', sql.VarChar(50), paymentData.paymentMethod)
                .input('PaymentDate', sql.DateTime, new Date())
                .input('Status', sql.VarChar(50), paymentData.status)
                .query(`
                    INSERT INTO Payments (OrderID, TransactionID, Amount, PaymentMethod, PaymentDate, Status)
                    VALUES (@OrderID, @TransactionID, @Amount, @PaymentMethod, @PaymentDate, @Status)
                `);
            
            const result = await pool.request()
                .input('OrderID', sql.Int, paymentData.orderId)
                .query('SELECT * FROM Payments WHERE OrderID = @OrderID');
            
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByOrderId(orderId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('OrderID', sql.Int, orderId)
                .query('SELECT * FROM Payments WHERE OrderID = @OrderID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByTransactionId(transactionId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('TransactionID', sql.VarChar(255), transactionId)
                .query('SELECT * FROM Payments WHERE TransactionID = @TransactionID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(paymentId, status) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('PaymentID', sql.Int, paymentId)
                .input('Status', sql.VarChar(50), status)
                .query(`
                    UPDATE Payments 
                    SET Status = @Status 
                    WHERE PaymentID = @PaymentID
                `);
            
            const result = await pool.request()
                .input('PaymentID', sql.Int, paymentId)
                .query('SELECT * FROM Payments WHERE PaymentID = @PaymentID');
            
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Payment;
