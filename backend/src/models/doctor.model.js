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
    // Bác sĩ chỉ bận khi đã có lịch hẹn được Staff xác nhận (Confirmed).
    // Lịch Pending (khách mới đặt, chưa xác nhận) KHÔNG tính là bận.
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
                d.Specialty,
                CASE WHEN d.DoctorID IN (
                    SELECT DoctorID 
                    FROM Appointments 
                    WHERE AppointmentDate = @AppointmentDate
                      AND AppointmentTime = CAST(@AppointmentTime AS TIME)
                      AND Status = 'Assigned'
                      AND DoctorID IS NOT NULL
                ) THEN 0 ELSE 1 END as IsAvailable
        from Users u
        join Roles r on r.RoleID = u.RoleID
        join Doctors d on d.UserID = u.UserID
        where r.RoleID = 2 AND u.IsActive = 1
    `);
    return result.recordset;
}

const findBookedSlots = async (date) => {
    const request = new sql.Request();
    request.input('AppointmentDate', sql.Date, date);

    // 1. Lấy tổng số bác sĩ đang hoạt động
    const doctorsCountResult = await request.query(`
        SELECT COUNT(*) as TotalDoctors 
        FROM Doctors d
        JOIN Users u ON d.UserID = u.UserID
        WHERE u.RoleID = 2 AND u.IsActive = 1
    `);
    const totalDoctors = doctorsCountResult.recordset[0].TotalDoctors;


    const appointmentsResult = await request.query(`
        SELECT 
            CONVERT(VARCHAR(5), AppointmentTime, 108) as timeStr,
            COUNT(*) as AppointmentCount
        FROM Appointments
        WHERE AppointmentDate = @AppointmentDate
          AND Status IN ('Assigned', 'Approved')
        GROUP BY AppointmentTime
    `);

    // 2. Khung giờ nào có số lịch hẹn >= số bác sĩ thì coi như "Full"
    const bookedSlots = appointmentsResult.recordset
        .filter(row => row.AppointmentCount >= totalDoctors)
        .map(row => row.timeStr);

    return bookedSlots;
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

module.exports = { findAllDoctors, findAvailableDoctors, findBookedSlots, findDoctorById, getAllServices };
