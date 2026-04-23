const { sql, poolPromise } = require('../../config/db');

const getCompletedAndCancelledStatuses = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT DISTINCT Status 
        FROM Appointments 
        WHERE Status IN ('Completed', 'Cancelled')
    `);
    return result.recordset.map(row => row.Status);
}

const getConsultationHistory = async (userId, search, startDate, endDate, status, page, limit) => {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('UserID', sql.Int, userId);

    let conditions = `a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) AND a.Status IN ('Completed', 'Cancelled')`;

    if (search) {
        conditions += ` AND (u.FullName LIKE @Search OR u.Phone LIKE @Search OR CAST(a.AppointmentID AS VARCHAR) LIKE @Search)`;
        request.input('Search', sql.NVarChar, `%${search}%`);
    }
    if (startDate && endDate) {
        conditions += ` AND CAST(a.AppointmentDate AS DATE) BETWEEN @StartDate AND @EndDate`;
        request.input('StartDate', sql.Date, startDate);
        request.input('EndDate', sql.Date, endDate);
    }

    if (status) {
        conditions += ` AND a.Status = @Status`;
        request.input('Status', sql.NVarChar, status);
    }

    const offset = (page - 1) * limit;
    request.input('Offset', sql.Int, offset);
    request.input('Limit', sql.Int, parseInt(limit));

    const countQuery = `
        SELECT COUNT(a.AppointmentID) AS total
        FROM Appointments a 
        JOIN Users u ON a.PatientID = u.UserID
        WHERE ${conditions}
    `;
    const countResult = await request.query(countQuery);
    const totalRecords = countResult.recordset[0].total;

    const query = `
        SELECT 
            a.AppointmentID AS id, 
            u.FullName AS patientName,
            u.Phone AS patientPhone,
            CONVERT(VARCHAR(10), a.AppointmentDate, 103) AS date,
            CONVERT(VARCHAR(5), a.AppointmentTime, 108) AS time,
            (SELECT STRING_AGG(s.ServiceName, ', ')
             FROM AppointmentServices aps 
             JOIN Services s ON aps.ServiceID = s.ServiceID 
             WHERE aps.AppointmentID = a.AppointmentID) AS services,
            a.Status AS status
        FROM Appointments a 
        JOIN Users u ON a.PatientID = u.UserID
        WHERE ${conditions}
        ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `;
    const result = await request.query(query);
    return {
        data: result.recordset,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: parseInt(page)
    };
};

const getHistoryDetail = async (appointmentId, userId) => {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('ApptID', sql.Int, appointmentId);
    request.input('UserID', sql.Int, userId);

    // 1. Lấy thông tin khám và tái khám
    const info = await request.query(`
        SELECT a.AppointmentID, 
               a.Status,
               a.Note AS patientNote, 
               a.MedicalRecord, 
               a.CancelReason,
               CONVERT(VARCHAR(10), a.FollowUpDate, 103) AS followUpDate,
               a.FollowUpNote, 
               u.FullName AS patientName,
               CONVERT(VARCHAR(10), a.AppointmentDate, 103) AS date,
               CONVERT(VARCHAR(5), a.AppointmentTime, 108) AS time
        FROM Appointments a
        JOIN Users u ON a.PatientID = u.UserID
        WHERE a.AppointmentID = @ApptID
        AND a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID)
    `);

    if (info.recordset.length === 0) {
        throw new Error("Không tìm thấy ca khám hoặc bạn không có quyền xem lịch sử này.");
    }

    // 2. Lấy đơn thuốc (Sản phẩm) từ OrderDetails
    const products = await request.query(`
        SELECT p.ProductName AS name, od.Quantity AS qty, od.UnitPrice AS price
        FROM Orders o
        JOIN OrderDetails od ON o.OrderID = od.OrderID
        JOIN Products p ON od.ProductID = p.ProductID
        WHERE o.AppointmentID = @ApptID
    `);

    return {
        info: info.recordset[0],
        products: products.recordset
    };
};

module.exports = {
    getCompletedAndCancelledStatuses,
    getConsultationHistory,
    getHistoryDetail
};