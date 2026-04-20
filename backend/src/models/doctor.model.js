const { sql } = require('../config/db');

const findAllDoctors = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        select  u.UserID, 
                u.Email, 
                u.FullName, 
                u.Phone, 
                u.[Address],
                d.AvatarURL,
                u.IsActive ,
                d.Bio,
                d.ExperienceYears,
                d.Specialty
        from Users u
        join Roles r on r.RoleID = u.RoleID
        join Doctors d on d.UserID = u.UserID
        where r.RoleID =3
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
                d.AvatarURL, 
                u.IsActive, 
                d.DoctorID, 
                d.Specialty, 
                d.ExperienceYears, 
                d.Bio,
                d.Description
            FROM Users u join [dbo].[Doctors] d 
                on u.UserId = d. UserId 
            WHERE u.RoleID = 3 and u.UserID = @UserId
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

module.exports = { findAllDoctors, findDoctorById, getAllServices };
