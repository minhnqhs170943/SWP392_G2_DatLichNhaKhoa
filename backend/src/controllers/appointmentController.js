const { poolPromise } = require('../config/db');
const sql = require('mssql');

// ==================== STAFF APIs ====================

// GET all appointments (Staff view)
exports.getAllAppointments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                a.AppointmentID, 
                a.PatientID,
                u.FullName AS PatientName, 
                u.Phone AS PatientPhone, 
                ud.FullName AS DoctorName,
                a.AppointmentDate, 
                a.AppointmentTime, 
                a.Status, 
                a.Note,
                a.CreatedAt,
                -- Gộp tên services
                STUFF((
                    SELECT ', ' + s.ServiceName
                    FROM Services s
                    WHERE s.AppointmentID = a.AppointmentID
                    FOR XML PATH(''), TYPE
                ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS ServiceNames,
                -- Tổng tiền dịch vụ
                (SELECT ISNULL(SUM(s.Price), 0)
                 FROM Services s
                 WHERE s.AppointmentID = a.AppointmentID) AS TotalPrice,
                -- Invoice & Payment info
                inv.InvoiceID,
                inv.Status AS InvoiceStatus,
                pay.PaymentID,
                pay.Status AS PaymentStatus,
                pay.PaymentMethod,
                pay.Amount AS PaidAmount,
                pay.PaymentDate
            FROM Appointments a
            JOIN Users u ON a.PatientID = u.UserID
            LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
            LEFT JOIN Users ud ON d.UserID = ud.UserID
            LEFT JOIN Invoices inv ON inv.AppointmentID = a.AppointmentID
            LEFT JOIN Payments pay ON pay.InvoiceID = inv.InvoiceID
            ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// PUT update status of an appointment
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp trạng thái mới." });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('status', sql.NVarChar, status)
            .query(`
                UPDATE Appointments 
                SET Status = @status, UpdatedAt = GETDATE()
                WHERE AppointmentID = @id
            `);

        // Nếu hủy → cập nhật Invoice thành Cancelled
        if (status === 'Cancelled') {
            await pool.request()
                .input('id', sql.Int, parseInt(id))
                .query(`
                    UPDATE Invoices SET Status = 'Cancelled' 
                    WHERE AppointmentID = @id AND Status = 'Unpaid'
                `);
        }

        res.json({
            success: true,
            message: "Cập nhật trạng thái thành công"
        });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// POST thanh toán appointment → auto xác nhận (Staff pays at clinic)
exports.payAppointment = async (req, res) => {
    try {
        const { id } = req.params; // AppointmentID
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn phương thức thanh toán." });
        }

        const pool = await poolPromise;

        // Lấy thông tin Invoice của Appointment
        const invoiceResult = await pool.request()
            .input('appointmentId', sql.Int, parseInt(id))
            .query(`
                SELECT inv.InvoiceID, inv.TotalAmount, inv.Status
                FROM Invoices inv
                WHERE inv.AppointmentID = @appointmentId
            `);

        let invoice;
        if (invoiceResult.recordset.length === 0) {
            // Tạo Invoice nếu chưa có
            const totalResult = await pool.request()
                .input('appointmentId', sql.Int, parseInt(id))
                .query(`
                    SELECT ISNULL(SUM(Price), 0) AS Total
                    FROM Services
                    WHERE AppointmentID = @appointmentId
                `);
            const totalAmount = totalResult.recordset[0].Total;

            const insertInvoice = await pool.request()
                .input('appointmentId', sql.Int, parseInt(id))
                .input('totalAmount', sql.Decimal(18, 2), totalAmount)
                .query(`
                    INSERT INTO Invoices (AppointmentID, TotalAmount, Status, IssuedDate)
                    VALUES (@appointmentId, @totalAmount, 'Unpaid', GETDATE());
                    SELECT * FROM Invoices WHERE InvoiceID = SCOPE_IDENTITY();
                `);
            invoice = insertInvoice.recordset[0];
        } else {
            invoice = invoiceResult.recordset[0];
        }

        const amount = invoice.TotalAmount || 0;

        // Tạo bản ghi Payment
        const transactionID = 'TXN' + Date.now();
        await pool.request()
            .input('invoiceId', sql.Int, invoice.InvoiceID)
            .input('transactionId', sql.VarChar, transactionID)
            .input('amount', sql.Decimal(18, 2), amount)
            .input('paymentMethod', sql.NVarChar, paymentMethod)
            .query(`
                INSERT INTO Payments (InvoiceID, TransactionID, Amount, PaymentMethod, PaymentDate, Status)
                VALUES (@invoiceId, @transactionId, @amount, @paymentMethod, GETDATE(), 'Completed')
            `);

        // Cập nhật Invoice status → Paid
        await pool.request()
            .input('invoiceId', sql.Int, invoice.InvoiceID)
            .query(`UPDATE Invoices SET Status = 'Paid' WHERE InvoiceID = @invoiceId`);

        // Auto chuyển Appointment Status → Confirmed
        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query(`
                UPDATE Appointments 
                SET Status = 'Confirmed', UpdatedAt = GETDATE()
                WHERE AppointmentID = @id
            `);

        res.json({
            success: true,
            message: "Thanh toán thành công! Lịch hẹn đã được tự động xác nhận.",
            data: {
                transactionID,
                amount,
                paymentMethod,
                newStatus: 'Confirmed'
            }
        });

    } catch (error) {
        console.error("Lỗi thanh toán lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// ==================== CUSTOMER APIs ====================

// POST create appointment (Customer booking)
exports.createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, services, appointmentDate, appointmentTime, note } = req.body;

        // Validate
        if (!patientId || !services || services.length === 0 || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng cung cấp đầy đủ thông tin: bệnh nhân, dịch vụ, ngày và giờ." 
            });
        }

        const pool = await poolPromise;

        // 1. Tạo Appointment (Status = Pending)
        const appointmentResult = await pool.request()
            .input('patientId', sql.Int, patientId)
            .input('doctorId', sql.Int, doctorId || null)
            .input('appointmentDate', sql.Date, appointmentDate)
            .input('appointmentTime', sql.VarChar, appointmentTime)
            .input('note', sql.NVarChar, note || null)
            .query(`
                INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, AppointmentTime, Status, Note, CreatedAt, UpdatedAt)
                VALUES (@patientId, @doctorId, @appointmentDate, @appointmentTime, 'Pending', @note, GETDATE(), GETDATE());
                SELECT SCOPE_IDENTITY() AS AppointmentID;
            `);
        
        const appointmentId = appointmentResult.recordset[0].AppointmentID;

        // 2. Tạo copy cho Services
        let totalAmount = 0;
        for (const svc of services) {
            // Lấy thông tin service gốc
            const originalServiceReq = await pool.request()
                .input('origId', sql.Int, svc.serviceId)
                .query('SELECT ServiceName, Description, ImageURL FROM Services WHERE ServiceID = @origId');
            const origSvc = originalServiceReq.recordset[0];
            
            if (origSvc) {
                await pool.request()
                    .input('appointmentId', sql.Int, appointmentId)
                    .input('serviceName', sql.NVarChar, origSvc.ServiceName)
                    .input('description', sql.NVarChar, origSvc.Description)
                    .input('priceAtBooking', sql.Decimal(18, 2), svc.price)
                    .input('imageUrl', sql.VarChar, origSvc.ImageURL)
                    .query(`
                        INSERT INTO Services (AppointmentID, ServiceName, Description, Price, ImageURL, IsActive)
                        VALUES (@appointmentId, @serviceName, @description, @priceAtBooking, @imageUrl, 1)
                    `);
                totalAmount += parseFloat(svc.price);
            }
        }

        // 3. Tạo Invoice (Status = Unpaid)
        const invoiceResult = await pool.request()
            .input('appointmentId', sql.Int, appointmentId)
            .input('totalAmount', sql.Decimal(18, 2), totalAmount)
            .query(`
                INSERT INTO Invoices (AppointmentID, TotalAmount, Status, IssuedDate)
                VALUES (@appointmentId, @totalAmount, 'Unpaid', GETDATE());
                SELECT SCOPE_IDENTITY() AS InvoiceID;
            `);

        const invoiceId = invoiceResult.recordset[0].InvoiceID;

        res.status(201).json({
            success: true,
            message: "Đặt lịch thành công! Vui lòng thanh toán để xác nhận.",
            data: {
                appointmentId,
                invoiceId,
                totalAmount,
                status: 'Pending'
            }
        });

    } catch (error) {
        console.error("Lỗi tạo lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// GET customer's appointments history
exports.getMyAppointments = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .query(`
                SELECT 
                    a.AppointmentID,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Status,
                    a.Note,
                    a.CreatedAt,
                    ud.FullName AS DoctorName,
                    d.Specialty AS DoctorSpecialty,
                    -- Gộp tên services
                    STUFF((
                        SELECT ', ' + s.ServiceName
                        FROM Services s
                        WHERE s.AppointmentID = a.AppointmentID
                        FOR XML PATH(''), TYPE
                    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS ServiceNames,
                    -- Tổng tiền
                    (SELECT ISNULL(SUM(s.Price), 0)
                     FROM Services s
                     WHERE s.AppointmentID = a.AppointmentID) AS TotalPrice,
                    -- Invoice/Payment status
                    inv.InvoiceID,
                    inv.Status AS InvoiceStatus,
                    pay.Status AS PaymentStatus,
                    pay.PaymentMethod,
                    pay.PaymentDate
                FROM Appointments a
                LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
                LEFT JOIN Users ud ON d.UserID = ud.UserID
                LEFT JOIN Invoices inv ON inv.AppointmentID = a.AppointmentID
                LEFT JOIN Payments pay ON pay.InvoiceID = inv.InvoiceID
                WHERE a.PatientID = @userId
                ORDER BY a.CreatedAt DESC
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Lỗi lấy lịch sử hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// GET single appointment detail
exports.getAppointmentDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        // Appointment info
        const appointmentResult = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query(`
                SELECT 
                    a.*,
                    u.FullName AS PatientName,
                    u.Phone AS PatientPhone,
                    u.Email AS PatientEmail,
                    ud.FullName AS DoctorName,
                    d.Specialty AS DoctorSpecialty
                FROM Appointments a
                JOIN Users u ON a.PatientID = u.UserID
                LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
                LEFT JOIN Users ud ON d.UserID = ud.UserID
                WHERE a.AppointmentID = @id
            `);

        if (appointmentResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn." });
        }

        // Services list
        const servicesResult = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query(`
                SELECT ServiceID, ServiceName, Price as PriceAtBooking
                FROM Services
                WHERE AppointmentID = @id
            `);

        // Invoice & Payment
        const invoiceResult = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query(`
                SELECT inv.*, pay.PaymentID, pay.TransactionID, pay.Amount AS PaidAmount,
                       pay.PaymentMethod, pay.PaymentDate, pay.Status AS PaymentStatus
                FROM Invoices inv
                LEFT JOIN Payments pay ON pay.InvoiceID = inv.InvoiceID
                WHERE inv.AppointmentID = @id
            `);

        res.json({
            success: true,
            data: {
                appointment: appointmentResult.recordset[0],
                services: servicesResult.recordset,
                invoice: invoiceResult.recordset[0] || null
            }
        });
    } catch (error) {
        console.error("Lỗi lấy chi tiết lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
