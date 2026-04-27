const { connectDB, sql } = require('../config/db');

/**
 * @desc    Get all invoices with details from Appointments and Orders
 * @route   GET /api/admin/invoices
 * @access  Private/Admin
 */
const getAllInvoices = async (req, res) => {
    const { search, type, status } = req.query;
    try {
        const pool = await connectDB();
        let query = `
            SELECT 
                i.InvoiceID,
                i.TotalAmount,
                i.IssuedDate,
                i.Status as InvoiceStatus,
                CASE 
                    WHEN i.AppointmentID IS NOT NULL THEN N'Hẹn khám'
                    WHEN i.OrderID IS NOT NULL THEN N'Đơn hàng sản phẩm'
                    ELSE N'Khác'
                END as TransactionType,
                COALESCE(u1.FullName, u2.FullName) as CustomerName,
                COALESCE(u1.Email, u2.Email) as CustomerEmail,
                i.AppointmentID,
                i.OrderID
            FROM Invoices i
            LEFT JOIN Appointments a ON i.AppointmentID = a.AppointmentID
            LEFT JOIN Users u1 ON a.PatientID = u1.UserID
            LEFT JOIN Orders o ON i.OrderID = o.OrderID
            LEFT JOIN Users u2 ON o.UserID = u2.UserID
        `;

        const request = pool.request();
        let whereClauses = [];

        if (search) {
            request.input('search', sql.NVarChar, `%${search}%`);
            whereClauses.push(`(u1.FullName LIKE @search OR u2.FullName LIKE @search OR i.InvoiceID LIKE @search)`);
        }

        if (type) {
            if (type === 'Appointment') {
                whereClauses.push(`i.AppointmentID IS NOT NULL`);
            } else if (type === 'Order') {
                whereClauses.push(`i.OrderID IS NOT NULL`);
            }
        }

        if (status) {
            request.input('status', sql.NVarChar, status);
            whereClauses.push(`i.Status = @status`);
        }

        if (req.query.date) {
            request.input('date', sql.Date, req.query.date);
            whereClauses.push(`CAST(i.IssuedDate AS DATE) = @date`);
        }

        if (req.query.startDate) {
            request.input('startDate', sql.Date, req.query.startDate);
            whereClauses.push(`CAST(i.IssuedDate AS DATE) >= @startDate`);
        }

        if (req.query.endDate) {
            request.input('endDate', sql.Date, req.query.endDate);
            whereClauses.push(`CAST(i.IssuedDate AS DATE) <= @endDate`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ` ORDER BY i.IssuedDate DESC`;

        const result = await request.query(query);
        res.status(200).json({ success: true, payload: result.recordset });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = {
    getAllInvoices
};
