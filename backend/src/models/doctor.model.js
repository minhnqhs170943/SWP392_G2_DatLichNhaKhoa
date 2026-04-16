const { sql } = require('../config/db');

const findAllDoctors = async () => {
    const request = new sql.Request();
    const result = await request.query(`
        SELECT d.DoctorID, u.FullName, u.Email, u.Phone, u.Address, u.AvatarURL, d.Specialty, d.ExperienceYears, d.Bio
        FROM Doctors d
        JOIN Users u ON d.UserID = u.UserID
        WHERE d.IsActive = 1 AND u.IsActive = 1
    `);
    return result.recordset;
}

const findDoctorById = async (doctorId) => {
    const request = new sql.Request();
    request.input('doctorId', sql.Int, doctorId);
    const result = await request.query(`
        SELECT d.DoctorID, u.FullName, u.Email, u.Phone, u.Address, u.AvatarURL, d.Specialty, d.ExperienceYears, d.Bio
        FROM Doctors d
        JOIN Users u ON d.UserID = u.UserID
        WHERE d.DoctorID = @doctorId AND d.IsActive = 1 AND u.IsActive = 1
    `);
    return result.recordset[0];
};

module.exports = { findAllDoctors, findDoctorById };
