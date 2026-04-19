const { sql } = require('../config/db');

const findAllDoctors = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        select  u.UserID, 
                u.Email, 
                u.FullName, 
                u.Phone, 
                u.Address,
                u.AvatarURL,
                u.IsActive 
        from Users u
        join Roles r on r.RoleID = u.RoleID
        where r.RoleID =2
    `);
    return result.recordset;
}

const findDoctorById = async (userId) => {
    const request = new sql.Request();
    request.input('UserId', sql.Int, userId);
    const result = await request.query(`
        SELECT u.UserID, 
            u.Email, 
            u.FullName, 
            u.Phone, 
            u.Address, 
            u.AvatarURL, 
            u.IsActive
        FROM Users u
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

module.exports = { findAllDoctors, findDoctorById, getAllServices };
