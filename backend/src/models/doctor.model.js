const { sql } = require('../config/db');

const findAllDoctors = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT 
            DoctorID,
            FullName,
            Specialty,
            ExperienceYears,
            Bio,
            AvatarURL,
            IsActive
        FROM dbo.Doctors
        WHERE IsActive = 1
        ORDER BY DoctorID DESC
    `);
    return result.recordset;
};

const findDoctorById = async (doctorId) => {
    const request = new sql.Request();
    request.input('doctorId', sql.Int, doctorId);
    const result = await request.query(`
        SELECT 
            DoctorID,
            FullName,
            Specialty,
            Description,
            ExperienceYears,
            Bio,
            AvatarURL,
            IsActive
        FROM Doctors
        WHERE DoctorID = @doctorId AND IsActive = 1
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
