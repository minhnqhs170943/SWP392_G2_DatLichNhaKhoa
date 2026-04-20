const { sql, poolPromise } = require('../../config/db');

const createRequest = async (userId, startDate, endDate) => {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('UserID', sql.Int, userId);
    if (startDate) request.input('StartDate', sql.Date, startDate);
    if (endDate) request.input('EndDate', sql.Date, endDate);
    return request;
};

const dateCondition = "CAST(a.AppointmentDate AS DATE) BETWEEN @StartDate AND @EndDate";

const getMetrics = async (userId, startDate, endDate) => {
    const request = await createRequest(userId, startDate, endDate);
    const query = `
        SELECT 
            COUNT(a.AppointmentID) AS total,
            SUM(CASE WHEN a.Status = 'Completed' THEN 1 ELSE 0 END) AS completed,
            COUNT(DISTINCT a.PatientID) AS newPatients,
            ISNULL(SUM(CASE WHEN i.Status = 'Paid' THEN i.TotalAmount ELSE 0 END), 0) AS revenue
        FROM Appointments a
        LEFT JOIN Invoices i ON a.AppointmentID = i.AppointmentID
        WHERE a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) 
        AND ${dateCondition}
    `;
    const result = await request.query(query);
    return result.recordset[0];
};

const getComboChartData = async (userId, filterMode, startDate, endDate) => {
    const request = await createRequest(userId, startDate, endDate);
    let timeSelect, groupBy, orderBy;

    if (filterMode === 'year') {
        timeSelect = "N'Tháng ' + CAST(MONTH(a.AppointmentDate) AS VARCHAR)";
        groupBy = "MONTH(a.AppointmentDate)";
        orderBy = "MONTH(a.AppointmentDate) ASC";
    } else {
        timeSelect = "CONVERT(VARCHAR(5), a.AppointmentDate, 103)"; 
        groupBy = "a.AppointmentDate";
        orderBy = "a.AppointmentDate ASC";
    }

    const query = `
        SELECT ${timeSelect} AS time, COUNT(a.AppointmentID) AS appointments,
               ISNULL(SUM(CASE WHEN i.Status = 'Paid' THEN i.TotalAmount ELSE 0 END), 0) AS revenue
        FROM Appointments a LEFT JOIN Invoices i ON a.AppointmentID = i.AppointmentID
        WHERE a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) AND ${dateCondition}
        GROUP BY ${timeSelect}, ${groupBy} ORDER BY ${orderBy}
    `;
    const result = await request.query(query);
    return result.recordset;
};

const getStatusDistribution = async (userId, startDate, endDate) => {
    const request = await createRequest(userId, startDate, endDate);
    const query = `
        SELECT 
            CASE a.Status
                WHEN 'Pending' THEN N'Chờ phân công'
                WHEN 'Assigned' THEN N'Chờ duyệt'
                WHEN 'Approved' THEN N'Đã duyệt'
                WHEN 'Completed' THEN N'Hoàn thành'
                WHEN 'Cancelled' THEN N'Hủy'
                ELSE a.Status
            END AS name,
            COUNT(a.AppointmentID) AS value
        FROM Appointments a
        WHERE a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) 
        AND ${dateCondition}
        GROUP BY a.Status
    `;
    const result = await request.query(query);
    return result.recordset;
};

const getTopServices = async (userId, startDate, endDate) => {
    const request = await createRequest(userId, startDate, endDate);
    const query = `
        SELECT TOP 5 
            s.ServiceName AS name, 
            COUNT(aps.ServiceID) AS count
        FROM Appointments a
        JOIN AppointmentServices aps ON a.AppointmentID = aps.AppointmentID
        JOIN Services s ON aps.ServiceID = s.ServiceID
        WHERE a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) 
        AND ${dateCondition}
        GROUP BY s.ServiceName
        ORDER BY count DESC
    `;
    const result = await request.query(query);
    return result.recordset;
};

const getAppointmentLists = async (userId, startDate, endDate) => {
    const request1 = await createRequest(userId, startDate, endDate);
    const pending = await request1.query(`
        SELECT a.AppointmentID AS id, u.FullName AS patient,
            CONVERT(VARCHAR(5), a.AppointmentTime, 108) + ' ' + CONVERT(VARCHAR(10), a.AppointmentDate, 103) AS time,
            (SELECT TOP 1 s.ServiceName FROM AppointmentServices aps JOIN Services s ON aps.ServiceID = s.ServiceID WHERE aps.AppointmentID = a.AppointmentID) AS service
        FROM Appointments a JOIN Users u ON a.PatientID = u.UserID
        WHERE a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) 
        AND a.Status = 'Assigned' AND ${dateCondition}
        ORDER BY a.AppointmentDate, a.AppointmentTime
    `);

    const request2 = await createRequest(userId, startDate, endDate);
    const approved = await request2.query(`
        SELECT a.AppointmentID AS id, u.FullName AS patient,
            CONVERT(VARCHAR(5), a.AppointmentTime, 108) + ' ' + CONVERT(VARCHAR(10), a.AppointmentDate, 103) AS time,
            (SELECT TOP 1 s.ServiceName FROM AppointmentServices aps JOIN Services s ON aps.ServiceID = s.ServiceID WHERE aps.AppointmentID = a.AppointmentID) AS service
        FROM Appointments a JOIN Users u ON a.PatientID = u.UserID
        WHERE a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) 
        AND a.Status = 'Approved' AND ${dateCondition}
        ORDER BY a.AppointmentDate, a.AppointmentTime
    `);

    if (approved.recordset.length > 0) approved.recordset[0].isNext = true;

    return { pending: pending.recordset, approved: approved.recordset };
};

const updateStatus = async (appointmentId, status, note, userId) => {
    const request = await createRequest(userId);
    let query = `UPDATE Appointments SET Status = @Status, UpdatedAt = GETDATE()`;
    if (note) {
        query += `, Note = @Note`;
        request.input('Note', sql.NVarChar, note);
    }
    query += ` WHERE AppointmentID = @AppointmentID AND DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID)`;
    
    request.input('AppointmentID', sql.Int, appointmentId);
    request.input('Status', sql.NVarChar, status);
    
    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
};

module.exports = { getMetrics, getComboChartData, getStatusDistribution, getTopServices, getAppointmentLists, updateStatus };