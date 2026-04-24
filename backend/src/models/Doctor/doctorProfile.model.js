const { sql, poolPromise } = require('../../config/db');

const getDoctorProfile = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(`
            SELECT u.FullName, u.Email, u.Phone, u.Address, u.AvatarURL AS Avatar, 
                   d.Specialty, d.ExperienceYears, d.Bio
            FROM Users u
            LEFT JOIN Doctors d ON u.UserID = d.UserID
            WHERE u.UserID = @UserID
        `);
    return result.recordset[0];
};

const updateDoctorProfile = async (userId, data) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        
        // 1. Cập nhật bảng Users
        await transaction.request()
            .input('UID', sql.Int, userId)
            .input('Name', sql.NVarChar, data.FullName)
            .input('Phone', sql.VarChar, data.Phone)
            .input('Address', sql.NVarChar, data.Address)
            .query(`UPDATE Users SET FullName = @Name, Phone = @Phone, Address = @Address WHERE UserID = @UID`);

        // 2. Cập nhật bảng Doctors
        await transaction.request()
            .input('UID', sql.Int, userId)
            .input('Spec', sql.NVarChar, data.Specialty)
            .input('ExpYears', sql.Int, data.ExperienceYears ? parseInt(data.ExperienceYears) : 0)
            .input('Bio', sql.NVarChar, data.Bio)
            .query(`UPDATE Doctors SET Specialty = @Spec, ExperienceYears = @ExpYears, Bio = @Bio WHERE UserID = @UID`);

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

// Hàm lấy mật khẩu cũ để kiểm tra
const getDoctorPassword = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .query(`SELECT Password FROM Users WHERE UserID = @UserID`);
    return result.recordset.length > 0 ? result.recordset[0].Password : null;
};

// Hàm cập nhật mật khẩu mới
const updateDoctorPassword = async (userId, hashedPassword) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Password', sql.NVarChar, hashedPassword)
        .query(`UPDATE Users SET Password = @Password WHERE UserID = @UserID`);
    return result.rowsAffected[0] > 0;
};

module.exports = { 
    getDoctorProfile, 
    updateDoctorProfile, 
    getDoctorPassword, 
    updateDoctorPassword 
};