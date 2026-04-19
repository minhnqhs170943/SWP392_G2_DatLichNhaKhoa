const { sql } = require('../config/db');

class Invoice {
    static async create(invoiceData) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('AppointmentID', sql.Int, invoiceData.appointmentId || null)
                .input('OrderID', sql.Int, invoiceData.orderId || null)
                .input('TotalAmount', sql.Decimal(18, 2), invoiceData.totalAmount)
                .input('PaymentLinkId', sql.VarChar(100), invoiceData.paymentLinkId || null)
                .input('Status', sql.NVarChar(50), invoiceData.status || 'Unpaid')
                .query(`
                    INSERT INTO Invoices (AppointmentID, OrderID, TotalAmount, PaymentLinkId, Status, IssuedDate)
                    VALUES (@AppointmentID, @OrderID, @TotalAmount, @PaymentLinkId, @Status, GETDATE());
                    SELECT * FROM Invoices WHERE InvoiceID = SCOPE_IDENTITY();
                `);
            
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
                .query('SELECT * FROM Invoices WHERE OrderID = @OrderID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(invoiceId, status) {
        try {
            const pool = await sql.connect();
            await pool.request()
                .input('InvoiceID', sql.Int, invoiceId)
                .input('Status', sql.NVarChar(50), status)
                .query(`
                    UPDATE Invoices 
                    SET Status = @Status 
                    WHERE InvoiceID = @InvoiceID
                `);
            
            const result = await pool.request()
                .input('InvoiceID', sql.Int, invoiceId)
                .query('SELECT * FROM Invoices WHERE InvoiceID = @InvoiceID');
            
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Invoice;
