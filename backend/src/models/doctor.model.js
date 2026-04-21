const { sql } = require('../config/db');

const findAllDoctors = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        select  u.UserID, 
                u.Email, 
                u.FullName, 
                u.Phone, 
                u.[Address],
                u.AvatarURL,
                u.IsActive ,
                d.DoctorID,
                d.Bio,
                d.ExperienceYears,
                d.Specialty
        from Users u
        join Roles r on r.RoleID = u.RoleID
        join Doctors d on d.UserID = u.UserID
        where r.RoleID = 2 AND u.IsActive = 1
    `);
    return result.recordset;
}

const findAvailableDoctors = async (date, time) => {
    const request = new sql.Request();
    request.input('AppointmentDate', sql.Date, date);
    request.input('AppointmentTime', sql.NVarChar, time);
    // Find all active doctors except those who have an appointment at the exact given date and time
    // that is NOT cancelled or completed (meaning it's Pending, Confirmed, Assigned).
    const result = await request.query(`
        select  u.UserID, 
                u.Email, 
                u.FullName, 
                u.Phone, 
                u.[Address],
                u.AvatarURL,
                u.IsActive ,
                d.DoctorID,
                d.Bio,
                d.ExperienceYears,
                d.Specialty
        from Users u
        join Roles r on r.RoleID = u.RoleID
        join Doctors d on d.UserID = u.UserID
        where r.RoleID = 2 AND u.IsActive = 1
        AND d.DoctorID NOT IN (
            SELECT DoctorID 
            FROM Appointments 
            WHERE AppointmentDate = @AppointmentDate
              AND AppointmentTime = CAST(@AppointmentTime AS TIME)
              AND Status NOT IN ('Cancelled', 'Completed')
              AND DoctorID IS NOT NULL
        )
    `);
    return result.recordset;
}

const findDoctorById = async (userId) => {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);
    const result = await request.query(`
           SELECT u.UserID, 
                u.FullName, 
                u.Email, 
                u.Phone, 
                u.Address, 
                u.AvatarURL, 
                u.IsActive, 
                d.DoctorID, 
                d.Specialty, 
                d.ExperienceYears, 
                d.Bio,
                d.Description
            FROM Users u join [dbo].[Doctors] d 
                on u.UserId = d. UserId 
            WHERE u.RoleID = 2 and u.UserID = @UserId
    `);
    return result.recordset[0];
};

 
const getAllServices = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            s.ServiceName, 
            s.[Description], 
            s.Price  
        from [dbo].[Services] s
        where s.IsActive =  1
    `);
    return result.recordset;
};

module.exports = { findAllDoctors, findAvailableDoctors, findDoctorById, getAllServices };
