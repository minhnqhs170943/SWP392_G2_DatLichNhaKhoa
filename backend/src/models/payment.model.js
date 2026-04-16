const { sql } = require('../config/db');

class Payment {
    static async create(paymentData) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('InvoiceID', sql.Int, paymentData.invoiceId)
                .input('TransactionID', sql.VarChar(100), paymentData.transactionId)
                .input('Amount', sql.Decimal(18, 2), paymentData.amount)
                .input('PaymentMethod', sql.NVarChar(50), paymentData.paymentMethod)
                .input('Status', sql.NVarChar(50), paymentData.status)
                .query(`
                    INSERT INTO Payments (InvoiceID, TransactionID, Amount, PaymentMethod, PaymentDate, Status)
                    VALUES (@InvoiceID, @TransactionID, @Amount, @PaymentMethod, GETDATE(), @Status);
                    SELECT * FROM Payments WHERE PaymentID = SCOPE_IDENTITY();
                `);
            
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByInvoiceId(invoiceId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('InvoiceID', sql.Int, invoiceId)
                .query('SELECT * FROM Payments WHERE InvoiceID = @InvoiceID');
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
                .query(`
                    SELECT p.* 
                    FROM Payments p
                    INNER JOIN Invoices i ON p.InvoiceID = i.InvoiceID
                    WHERE i.OrderID = @OrderID
                `);
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByTransactionId(transactionId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('TransactionID', sql.VarChar(100), transactionId)
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
                .input('Status', sql.NVarChar(50), status)
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
