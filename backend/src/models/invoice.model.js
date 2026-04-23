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

    // ==========================================
    // CÁC HÀM MỚI THÊM CHO QUẢN LÝ HÓA ĐƠN STAFF
    // ==========================================

    // Lấy 1 hóa đơn theo ID
    static async findById(invoiceId) {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('InvoiceID', sql.Int, invoiceId)
                .query('SELECT * FROM Invoices WHERE InvoiceID = @InvoiceID');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách hóa đơn của lịch khám bệnh để hiển thị trên Frontend
    static async getAppointmentInvoices() {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .query(`
                    SELECT 
                        i.InvoiceID as id, 
                        i.AppointmentID as appointmentId,
                        u.FullName as patientName, 
                        u.Phone as phone, 
                        'Khám và Điều trị' as service,
                        CONVERT(varchar, a.AppointmentDate, 103) as date, 
                        i.TotalAmount as amount, 
                        CASE WHEN i.Status = 'SUCCESS' THEN 'Paid' ELSE 'Unpaid' END as status
                    FROM Invoices i
                    JOIN Appointments a ON i.AppointmentID = a.AppointmentID
                    JOIN Users u ON a.PatientID = u.UserID
                    WHERE i.AppointmentID IS NOT NULL
                    ORDER BY i.IssuedDate DESC
                `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Invoice;