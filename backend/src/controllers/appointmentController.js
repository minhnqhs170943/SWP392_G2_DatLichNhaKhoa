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
                a.DoctorID,
                ud.FullName AS DoctorName,
                a.AppointmentDate, 
                a.AppointmentTime, 
                a.Status, 
                a.Note,
                a.CreatedAt,
                -- SỬA LỖI: Lấy tên dịch vụ từ bảng trung gian AppointmentServices
                STUFF((
                    SELECT ', ' + s.ServiceName
                    FROM AppointmentServices aps

                    JOIN Services s ON aps.ServiceID = s.ServiceID
                    WHERE aps.AppointmentID = a.AppointmentID
                    FOR XML PATH(''), TYPE
                ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS ServiceNames,
                -- SỬA LỖI: Tính tổng tiền từ bảng trung gian AppointmentServices

                (SELECT ISNULL(SUM(aps.PriceAtBooking), 0)
                 FROM AppointmentServices aps
                 WHERE aps.AppointmentID = a.AppointmentID) AS TotalPrice,
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

// PUT confirm appointment (Staff xác nhận + phân công bác sĩ nếu cần)
exports.confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctorId, autoAssign } = req.body;

        const pool = await poolPromise;

        const apptResult = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('SELECT * FROM Appointments WHERE AppointmentID = @id');

        if (apptResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn." });
        }

        const appointment = apptResult.recordset[0];

        if (appointment.Status !== 'Pending') {
            return res.status(400).json({ success: false, message: "Chỉ có thể xác nhận lịch hẹn đang ở trạng thái Pending." });
        }

        let finalDoctorId = appointment.DoctorID;

        if (!finalDoctorId) {
            if (doctorId) {
                const docCheck = await pool.request()
                    .input('docId', sql.Int, parseInt(doctorId))
                    .query('SELECT DoctorID FROM Doctors WHERE DoctorID = @docId');
                if (docCheck.recordset.length === 0) {
                    return res.status(404).json({ success: false, message: "Không tìm thấy bác sĩ." });
                }
                finalDoctorId = parseInt(doctorId);
            } else if (autoAssign) {
                const availableResult = await pool.request()
                    .input('appDate', sql.Date, appointment.AppointmentDate)
                    .input('appTime', sql.NVarChar, appointment.AppointmentTime)
                    .query(`
                        SELECT TOP 1 d.DoctorID
                        FROM Doctors d
                        JOIN Users u ON d.UserID = u.UserID
                        WHERE u.RoleID = 2 AND u.IsActive = 1
                        AND d.DoctorID NOT IN (
                            SELECT DoctorID FROM Appointments
                            WHERE AppointmentDate = @appDate
                              AND AppointmentTime = CAST(@appTime AS TIME)
                              AND Status NOT IN ('Cancelled', 'Completed')
                              AND DoctorID IS NOT NULL
                        )
                    `);
                if (availableResult.recordset.length === 0) {
                    return res.status(400).json({ success: false, message: "Không có bác sĩ nào rảnh trong khung giờ này. Vui lòng chọn bác sĩ thủ công." });
                }
                finalDoctorId = availableResult.recordset[0].DoctorID;
            } else {
                return res.status(400).json({ success: false, message: "Lịch hẹn chưa có bác sĩ. Vui lòng chọn bác sĩ hoặc bật tự động phân công." });
            }
        }

        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('doctorId', sql.Int, finalDoctorId)
            .query(`
                UPDATE Appointments 
                SET DoctorID = @doctorId, Status = 'Assigned', UpdatedAt = GETDATE()
                WHERE AppointmentID = @id
            `);

        const doctorInfo = await pool.request()
            .input('docId', sql.Int, finalDoctorId)
            .query(`SELECT u.FullName FROM Users u JOIN Doctors d ON u.UserID = d.UserID WHERE d.DoctorID = @docId`);

        res.json({
            success: true,
            message: "Xác nhận lịch hẹn thành công!",
            data: {
                doctorId: finalDoctorId,
                doctorName: doctorInfo.recordset[0]?.FullName || '',
                newStatus: 'Confirmed'
            }
        });
    } catch (error) {
        console.error("Lỗi xác nhận lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

// POST thanh toán appointment → auto xác nhận (Staff pays at clinic)
exports.payAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: "Vui lòng chọn phương thức thanh toán." });
        }

        const pool = await poolPromise;
        const appointmentId = parseInt(id);

        // Chỉ cho thanh toán lịch hẹn đã Confirmed
        const appointmentResult = await pool.request()
            .input('appointmentId', sql.Int, appointmentId)
            .query(`
                SELECT AppointmentID, Status
                FROM Appointments
                WHERE AppointmentID = @appointmentId
            `);

        if (appointmentResult.recordset.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn." });
        }

        const appointment = appointmentResult.recordset[0];
        if (appointment.Status !== 'Confirmed') {
            return res.status(400).json({
                success: false,
                message: "Chỉ thanh toán được khi lịch hẹn ở trạng thái Confirmed."
            });
        }

        const invoiceResult = await pool.request()
            .input('appointmentId', sql.Int, appointmentId)
            .query(`
                SELECT inv.InvoiceID, inv.TotalAmount, inv.Status
                FROM Invoices inv
                WHERE inv.AppointmentID = @appointmentId
            `);

        let invoice;
        if (invoiceResult.recordset.length === 0) {
            // SỬA LỖI: Tính tổng tiền từ bảng trung gian AppointmentServices
            const totalResult = await pool.request()
                .input('appointmentId', sql.Int, appointmentId)
                .query(`

                    SELECT ISNULL(SUM(PriceAtBooking), 0) AS Total
                    FROM AppointmentServices
                    WHERE AppointmentID = @appointmentId

                `);
            const totalAmount = totalResult.recordset[0].Total;

            const insertInvoice = await pool.request()
                .input('appointmentId', sql.Int, appointmentId)
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

        if ((invoice.Status || '').toLowerCase() === 'paid') {
            return res.status(400).json({
                success: false,
                message: "Lịch hẹn này đã được thanh toán."
            });
        }

        const amount = invoice.TotalAmount || 0;

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

        await pool.request()
            .input('invoiceId', sql.Int, invoice.InvoiceID)
            .query(`UPDATE Invoices SET Status = 'Paid' WHERE InvoiceID = @invoiceId`);


        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query(`
                UPDATE Appointments 
                SET Status = 'Confirmed', UpdatedAt = GETDATE()
                WHERE AppointmentID = @id
            `);


        res.json({
            success: true,
            message: "Thanh toán thành công!",
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
            .input('appointmentTime', sql.NVarChar, appointmentTime)
            .input('note', sql.NVarChar, note || null)
            .query(`
                INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, AppointmentTime, Status, Note, CreatedAt, UpdatedAt)
                VALUES (@patientId, @doctorId, @appointmentDate, CAST(@appointmentTime AS TIME), 'Pending', @note, GETDATE(), GETDATE());
                SELECT SCOPE_IDENTITY() AS AppointmentID;
            `);
        
        const appointmentId = appointmentResult.recordset[0].AppointmentID;


        // 2. SỬA LỖI: Lưu dịch vụ vào bảng trung gian AppointmentServices
        let totalAmount = 0;
        for (const svc of services) {
            const originalServiceReq = await pool.request()
                .input('origId', sql.Int, svc.serviceId)
                .query('SELECT Price FROM Services WHERE ServiceID = @origId');
            
            if (originalServiceReq.recordset.length > 0) {
                // Ưu tiên giá truyền từ client, nếu không có thì lấy giá gốc
                const priceAtBooking = svc.price !== undefined ? svc.price : originalServiceReq.recordset[0].Price;
                
                await pool.request()
                    .input('appointmentId', sql.Int, appointmentId)
                    .input('serviceId', sql.Int, svc.serviceId)
                    .input('priceAtBooking', sql.Decimal(18, 2), priceAtBooking)
                    .query(`
                        INSERT INTO AppointmentServices (AppointmentID, ServiceID, PriceAtBooking)
                        VALUES (@appointmentId, @serviceId, @priceAtBooking)
                    `);
                totalAmount += parseFloat(priceAtBooking);
            }

        }

        // 3. Tạo Invoice (Status = Unpaid)
        // const invoiceResult = await pool.request()
        //     .input('appointmentId', sql.Int, appointmentId)
        //     .input('totalAmount', sql.Decimal(18, 2), totalAmount)
        //     .query(`
        //         INSERT INTO Invoices (AppointmentID, TotalAmount, Status, IssuedDate)
        //         VALUES (@appointmentId, @totalAmount, 'Unpaid', GETDATE());
        //         SELECT SCOPE_IDENTITY() AS InvoiceID;
        //     `);

        // const invoiceId = invoiceResult.recordset[0].InvoiceID;

        res.status(201).json({
            success: true,
            message: "Đặt lịch thành công! Vui lòng thanh toán để xác nhận.",
            data: {
                appointmentId,
                // invoiceId,
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
                    STUFF((
                        SELECT ', ' + s.ServiceName
                        FROM AppointmentServices aps

                        JOIN Services s ON aps.ServiceID = s.ServiceID
                        WHERE aps.AppointmentID = a.AppointmentID
                        FOR XML PATH(''), TYPE
                    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS ServiceNames,
                    -- SỬA LỖI: Tính tổng tiền từ bảng trung gian AppointmentServices

                    (SELECT ISNULL(SUM(aps.PriceAtBooking), 0)
                     FROM AppointmentServices aps
                     WHERE aps.AppointmentID = a.AppointmentID) AS TotalPrice,
                    -- Invoice/Payment status
                    inv.InvoiceID,
                    inv.TotalAmount AS InvoiceTotalAmount,
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

        // SỬA LỖI: Join với bảng AppointmentServices
        const servicesResult = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query(`
                SELECT s.ServiceID, s.ServiceName, aps.PriceAtBooking
                FROM AppointmentServices aps

                JOIN Services s ON aps.ServiceID = s.ServiceID

                WHERE aps.AppointmentID = @id
            `);

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

// GET customer's unpaid appointment invoices for cart/checkout
exports.getMyUnpaidAppointmentInvoices = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .query(`
                SELECT
                    i.InvoiceID,
                    a.AppointmentID,
                    i.IssuedDate,
                    p.FullName AS PatientName,
                    p.Phone AS PatientPhone,
                    dr.FullName AS DoctorName,
                    a.MedicalRecord,
                    ISNULL((
                        SELECT STRING_AGG(s.ServiceName, ', ')
                        FROM AppointmentServices aps
                        JOIN Services s ON aps.ServiceID = s.ServiceID
                        WHERE aps.AppointmentID = a.AppointmentID
                    ), N'Không có dịch vụ') AS ServicesList,
                    ISNULL((
                        SELECT STRING_AGG(pr.ProductName + ' (x' + CAST(od.Quantity AS VARCHAR) + ')', ', ')
                        FROM OrderDetails od
                        JOIN Products pr ON od.ProductID = pr.ProductID
                        WHERE od.OrderID = i.OrderID
                    ), N'Không có đơn thuốc') AS ProductsList,
                    ISNULL((
                        SELECT SUM(aps.PriceAtBooking)
                        FROM AppointmentServices aps
                        WHERE aps.AppointmentID = a.AppointmentID
                    ), 0) AS ServiceAmount,
                    ISNULL((
                        SELECT SUM(od.Quantity * od.UnitPrice)
                        FROM OrderDetails od
                        WHERE od.OrderID = i.OrderID
                    ), 0) AS ProductAmount,
                    i.TotalAmount,
                    i.Status
                FROM Invoices i
                JOIN Appointments a ON i.AppointmentID = a.AppointmentID
                JOIN Users p ON a.PatientID = p.UserID
                LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
                LEFT JOIN Users dr ON d.UserID = dr.UserID
                WHERE p.UserID = @userId
                  AND i.Status = 'Unpaid'
                ORDER BY i.IssuedDate DESC, i.InvoiceID DESC
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Lỗi lấy hóa đơn chưa thanh toán của bệnh nhân:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
