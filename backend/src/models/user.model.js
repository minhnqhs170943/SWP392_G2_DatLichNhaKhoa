const { sql } = require('../config/db');

const findUserByEmail = async (email) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const result = await request.query('SELECT * FROM Users WHERE Email = @email');
    return result.recordset[0];
};

const createUser = async (userData) => {
    const { username, passwordHash, fullName, email, phone, address } = userData;
    const request = new sql.Request();
    
    request.input('roleId', sql.Int, 3);
    request.input('username', sql.VarChar, username);
    request.input('passwordHash', sql.VarChar, passwordHash);
    request.input('fullName', sql.NVarChar, fullName);
    request.input('email', sql.VarChar, email);
    request.input('phone', sql.VarChar, phone);
    request.input('address', sql.NVarChar, address);

    // Dùng INSERT INTO
    await request.query(`
        INSERT INTO Users (RoleID, Username, PasswordHash, FullName, Email, Phone, Address) 
        VALUES (@roleId, @username, @passwordHash, @fullName, @email, @phone, @address)
    `);
};

module.exports = { findUserByEmail, createUser };