const { sql } = require('../config/db');

const get5LastestReviews = async () => {
    const request = new sql.Request()
    const result = await request.query(` 
        Select top 5
            u.FullName as UserName, 
            r.Rating, r.Comment , 
            d.FullName as DoctorName
        from [dbo].[Reviews] r
        join [dbo].[Users] u 
        on r.UserID = u.UserID
        join [dbo].[Doctors] d
        on r.DoctorID = d.DoctorID
        order by r.CreatedAt desc`);
    return result.recordset;
};

const getAppointmentById = async (userId) => {
    const userid = await parseInt(userId);
    const request = new sql.Request();
    request.input('UserId', sql.Int, userid);
    const result = await request.query(`
        select u.UserID,
            u.FullName as userName,
            d.FullName as doctorName,
            a.AppointmentDate,
            a.Note,
            d.Specialty as ChuyenMon,
            a.Status
        from Appointments a
       join Users u 
       on u.UserID = a.UserID
       join Doctors d
       on d.DoctorID = a.DoctorID

         Where u.UserID = @UserId  and a.Status = 'Completed'
        `
        
    );
    return result.recordset;
};

 
module.exports = { get5LastestReviews, getAppointmentById };