-- =======================================================
-- SCRIPT TẠO DỮ LIỆU MẪU ĐỂ HIỂN THỊ DASHBOARD (STAFF & ADMIN)
-- =======================================================
-- Chú ý: Script này giả định bạn đã có ít nhất 2 Bệnh nhân (RoleID = 1), 
-- 2 Bác sĩ (RoleID = 2) và 2 Dịch vụ (Services) trong database.
-- Hãy chạy toàn bộ script này trong SQL Server Management Studio.

BEGIN TRY
    BEGIN TRANSACTION;

    -- Lấy ID bệnh nhân mẫu
    DECLARE @Patient1 INT = (SELECT TOP 1 UserID FROM Users WHERE RoleID = 1);
    DECLARE @Patient2 INT = (SELECT TOP 1 UserID FROM Users WHERE RoleID = 1 ORDER BY UserID DESC);

    -- Lấy ID bác sĩ mẫu
    DECLARE @Doctor1 INT = (SELECT TOP 1 DoctorID FROM Doctors);
    DECLARE @Doctor2 INT = (SELECT TOP 1 DoctorID FROM Doctors ORDER BY DoctorID DESC);

    -- Lấy ID dịch vụ mẫu
    DECLARE @Service1 INT = (SELECT TOP 1 ServiceID FROM Services);
    DECLARE @Service2 INT = (SELECT TOP 1 ServiceID FROM Services ORDER BY ServiceID DESC);

    IF @Patient1 IS NULL OR @Doctor1 IS NULL OR @Service1 IS NULL
    BEGIN
        PRINT N'❌ Lỗi: Cần có ít nhất 1 Patient, 1 Doctor và 1 Service trong Database để chạy seed này!';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- 1. CHÈN LỊCH HẸN (Appointments)
    -- Gồm nhiều trạng thái: Completed, Confirmed, Pending, Cancelled và trải dài thời gian
    INSERT INTO Appointments (PatientID, DoctorID, AppointmentDate, AppointmentTime, Status, Note, CreatedAt, UpdatedAt)
    VALUES 
    (@Patient1, @Doctor1, DATEADD(day, -2, CAST(GETDATE() AS DATE)), '09:00', 'Completed', N'Khám định kỳ', DATEADD(day, -5, GETDATE()), DATEADD(day, -2, GETDATE())),
    (@Patient2, @Doctor2, DATEADD(day, -10, CAST(GETDATE() AS DATE)), '10:00', 'Completed', N'Đau răng', DATEADD(day, -12, GETDATE()), DATEADD(day, -10, GETDATE())),
    (@Patient1, @Doctor2, DATEADD(month, -1, CAST(GETDATE() AS DATE)), '14:00', 'Completed', N'Nhổ răng khôn', DATEADD(month, -1, GETDATE()), DATEADD(month, -1, GETDATE())),
    (@Patient2, @Doctor1, DATEADD(month, -2, CAST(GETDATE() AS DATE)), '11:00', 'Completed', N'Cạo vôi răng', DATEADD(month, -2, GETDATE()), DATEADD(month, -2, GETDATE())),
    (@Patient1, @Doctor1, DATEADD(day, 2, CAST(GETDATE() AS DATE)), '08:00', 'Confirmed', N'Trám răng', GETDATE(), GETDATE()),
    (@Patient2, @Doctor2, DATEADD(day, 5, CAST(GETDATE() AS DATE)), '15:00', 'Pending', N'Tư vấn niềng răng', GETDATE(), GETDATE()),
    (@Patient1, @Doctor2, DATEADD(day, -5, CAST(GETDATE() AS DATE)), '16:00', 'Cancelled', N'Bệnh nhân bận', DATEADD(day, -7, GETDATE()), DATEADD(day, -6, GETDATE()));

    -- Lấy danh sách ID vừa chèn (Lưu ý bảng #Temp)
    DECLARE @App1 INT = (SELECT AppointmentID FROM Appointments ORDER BY AppointmentID DESC OFFSET 6 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @App2 INT = (SELECT AppointmentID FROM Appointments ORDER BY AppointmentID DESC OFFSET 5 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @App3 INT = (SELECT AppointmentID FROM Appointments ORDER BY AppointmentID DESC OFFSET 4 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @App4 INT = (SELECT AppointmentID FROM Appointments ORDER BY AppointmentID DESC OFFSET 3 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @App5 INT = (SELECT AppointmentID FROM Appointments ORDER BY AppointmentID DESC OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @App6 INT = (SELECT AppointmentID FROM Appointments ORDER BY AppointmentID DESC OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @App7 INT = (SELECT TOP 1 AppointmentID FROM Appointments ORDER BY AppointmentID DESC);

    -- 2. CHÈN DỊCH VỤ CỦA LỊCH HẸN (AppointmentServices)
    INSERT INTO AppointmentServices (AppointmentID, ServiceID, PriceAtBooking)
    VALUES 
    (@App1, @Service1, 500000),
    (@App2, @Service2, 2000000),
    (@App3, @Service1, 500000),
    (@App3, @Service2, 2000000),
    (@App4, @Service1, 500000),
    (@App5, @Service1, 500000),
    (@App6, @Service2, 2000000),
    (@App7, @Service1, 500000);

    -- 3. CHÈN HÓA ĐƠN (Invoices)
    INSERT INTO Invoices (AppointmentID, TotalAmount, Status, IssuedDate)
    VALUES
    (@App1, 500000, 'Paid', DATEADD(day, -2, GETDATE())),
    (@App2, 2000000, 'Paid', DATEADD(day, -10, GETDATE())),
    (@App3, 2500000, 'Paid', DATEADD(month, -1, GETDATE())),
    (@App4, 500000, 'Paid', DATEADD(month, -2, GETDATE())),
    (@App5, 500000, 'Paid', GETDATE()), 
    (@App6, 2000000, 'Unpaid', GETDATE()),
    (@App7, 500000, 'Cancelled', DATEADD(day, -6, GETDATE()));

    DECLARE @Inv1 INT = (SELECT InvoiceID FROM Invoices ORDER BY InvoiceID DESC OFFSET 6 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @Inv2 INT = (SELECT InvoiceID FROM Invoices ORDER BY InvoiceID DESC OFFSET 5 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @Inv3 INT = (SELECT InvoiceID FROM Invoices ORDER BY InvoiceID DESC OFFSET 4 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @Inv4 INT = (SELECT InvoiceID FROM Invoices ORDER BY InvoiceID DESC OFFSET 3 ROWS FETCH NEXT 1 ROWS ONLY);
    DECLARE @Inv5 INT = (SELECT InvoiceID FROM Invoices ORDER BY InvoiceID DESC OFFSET 2 ROWS FETCH NEXT 1 ROWS ONLY);

    -- 4. CHÈN THANH TOÁN (Payments)
    INSERT INTO Payments (InvoiceID, TransactionID, Amount, PaymentMethod, PaymentDate, Status)
    VALUES
    (@Inv1, 'TXN20001', 500000, 'Cash', DATEADD(day, -2, GETDATE()), 'Completed'),
    (@Inv2, 'TXN20002', 2000000, 'Bank Transfer', DATEADD(day, -10, GETDATE()), 'Completed'),
    (@Inv3, 'TXN20003', 2500000, 'PAYOS', DATEADD(month, -1, GETDATE()), 'Completed'),
    (@Inv4, 'TXN20004', 500000, 'Cash', DATEADD(month, -2, GETDATE()), 'Completed'),
    (@Inv5, 'TXN20005', 500000, 'Bank Transfer', GETDATE(), 'Completed');

    COMMIT TRANSACTION;
    PRINT N'✅ Đã chèn dữ liệu mẫu thành công! Bạn có thể làm mới trang Dashboard để xem kết quả.';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'❌ Đã xảy ra lỗi: ' + ERROR_MESSAGE();
END CATCH;
