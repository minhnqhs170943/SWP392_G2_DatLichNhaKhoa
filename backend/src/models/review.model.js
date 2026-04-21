const { sql } = require('../config/db');

const getLatestReviews = async ( ) => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT TOP 5
            r.ReviewID,
            r.AppointmentID,
            pu.FullName AS UserName,
            du.FullName AS DoctorName,
            d.Specialty,
            r.Rating,
            r.Comment,
            r.CreatedAt,
            r.UpdatedAt
        FROM Reviews r
        JOIN Users pu ON pu.UserID = r.UserID
        JOIN Appointments a ON a.AppointmentID = r.AppointmentID
        JOIN Doctors d ON d.DoctorID = a.DoctorID
        JOIN Users du ON du.UserID = d.UserID
        ORDER BY r.CreatedAt DESC
    `);
    return result.recordset;
};

const getEligibleAppointmentsByUserId = async (userId) => {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);
    const result = await request.query(`
        SELECT
            a.AppointmentID,
            a.AppointmentDate,
            a.AppointmentTime,
            a.Note,
            a.Status,
            du.FullName AS DoctorName,
            d.Specialty,
            r.ReviewID,
            r.Rating,
            r.Comment,
            ISNULL(r.EditCount, 0) AS EditCount,
            CASE
                WHEN r.ReviewID IS NULL THEN 1
                ELSE 0
            END AS CanReviewOrEdit
        FROM Appointments a
        JOIN Doctors d ON d.DoctorID = a.DoctorID
        JOIN Users du ON du.UserID = d.UserID
        LEFT JOIN Reviews r ON r.AppointmentID = a.AppointmentID
        WHERE a.PatientID = @UserId
          AND a.Status = 'Completed'
        ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
        `
    );
    return result.recordset;
};

const createReview = async ({ appointmentId, userId, rating, comment }) => {
    const request = new sql.Request();
    request.input('AppointmentID', sql.Int, appointmentId);
    request.input('UserID', sql.Int, userId);
    request.input('Rating', sql.Int, rating);
    request.input('Comment', sql.NVarChar(sql.MAX), comment || null);

    const result = await request.query(`
        INSERT INTO Reviews (AppointmentID, UserID, Rating, Comment, CreatedAt, EditCount, UpdatedAt)
        SELECT
            a.AppointmentID,
            @UserID,
            @Rating,
            @Comment,
            GETDATE(),
            0,
            NULL
        FROM Appointments a
        WHERE a.AppointmentID = @AppointmentID
          AND a.PatientID = @UserID
          AND a.Status = 'Completed'
          AND NOT EXISTS (
              SELECT 1 FROM Reviews r WHERE r.AppointmentID = a.AppointmentID
          );

        SELECT @@ROWCOUNT AS Affected;
    `);

    return result.recordset[0]?.Affected > 0;
};

const updateReviewByAppointment = async ({ appointmentId, userId, rating, comment }) => {
    const request = new sql.Request();
    request.input('AppointmentID', sql.Int, appointmentId);
    request.input('UserID', sql.Int, userId);
    request.input('Rating', sql.Int, rating);
    request.input('Comment', sql.NVarChar(sql.MAX), comment || null);

    const result = await request.query(`
        UPDATE r
        SET
            r.Rating = @Rating,
            r.Comment = @Comment,
            r.EditCount = r.EditCount + 1,
            r.UpdatedAt = GETDATE()
        FROM Reviews r
        JOIN Appointments a ON a.AppointmentID = r.AppointmentID
        WHERE r.AppointmentID = @AppointmentID
          AND r.UserID = @UserID
          AND a.PatientID = @UserID
          AND a.Status = 'Completed'
          AND ISNULL(r.EditCount, 0) < 1;

        SELECT @@ROWCOUNT AS Affected;

    `);

    return result.recordset[0]?.Affected > 0;
};

module.exports = {
    getLatestReviews,
    getEligibleAppointmentsByUserId,
    createReview,
    updateReviewByAppointment
};
