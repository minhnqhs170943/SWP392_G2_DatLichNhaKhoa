const { sql, poolPromise } = require('../../config/db');

const getAllServicesList = async () => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        const query = `SELECT ServiceName FROM Services ORDER BY ServiceName`;
        const result = await request.query(query);
        return result.recordset ? result.recordset.map(s => s.ServiceName) : [];
    } catch (error) {
        throw error;
    }
};

const getPendingAppointments = async (userId, search, startDate, endDate, service, page, limit) => {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('UserID', sql.Int, userId);

    let conditions = `a.DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID) AND a.Status = 'Assigned'`;

    if (search) {
        conditions += ` AND (u.FullName LIKE @Search OR u.Phone LIKE @Search OR CAST(a.AppointmentID AS VARCHAR) LIKE @Search)`;
        request.input('Search', sql.NVarChar, `%${search}%`);
    }
    if (startDate && endDate) {
        conditions += ` AND CAST(a.AppointmentDate AS DATE) BETWEEN @StartDate AND @EndDate`;
        request.input('StartDate', sql.Date, startDate);
        request.input('EndDate', sql.Date, endDate);
    }
    if (service) {
        conditions += ` AND EXISTS (
            SELECT 1 FROM AppointmentServices aps 
            JOIN Services s ON aps.ServiceID = s.ServiceID 
            WHERE aps.AppointmentID = a.AppointmentID AND s.ServiceName = @Service
        )`;
        request.input('Service', sql.NVarChar, service);
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
            a.Note AS patientNote,
            (
            SELECT STRING_AGG(s.ServiceName, ', ') 
            FROM AppointmentServices aps 
            JOIN Services s ON aps.ServiceID = s.ServiceID 
            WHERE aps.AppointmentID = a.AppointmentID
            ) AS services
        FROM Appointments a
        JOIN Users u ON a.PatientID = u.UserID
        WHERE ${conditions}
        ORDER BY a.AppointmentDate ASC, a.AppointmentTime ASC
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

const updateAppointmentStatus = async (appointmentId, status, cancelReason, userId) => {
    const pool = await poolPromise;
    const request = pool.request();

    let query = `UPDATE Appointments SET Status = @Status, UpdatedAt = GETDATE()`;

    if (status === 'Cancelled' && cancelReason) {
        query += `, CancelReason = @CancelReason`;
        request.input('CancelReason', sql.NVarChar, cancelReason);
    }

    query += ` WHERE AppointmentID = @AppointmentID AND DoctorID = (SELECT DoctorID FROM Doctors WHERE UserID = @UserID)`;

    request.input('AppointmentID', sql.Int, appointmentId);
    request.input('Status', sql.NVarChar, status);
    request.input('UserID', sql.Int, userId);

    const result = await request.query(query);
    return result.rowsAffected[0] > 0;
};

module.exports = { getPendingAppointments, getAllServicesList, updateAppointmentStatus };