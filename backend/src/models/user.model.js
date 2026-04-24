const { sql } = require('../config/db');

const findUserByEmail = async (email) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const result = await request.query('SELECT * FROM Users WHERE Email = @email');
    return result.recordset[0];
};

const findUserByPhone = async (phone) => {
    const request = new sql.Request();
    request.input('phone', sql.VarChar, phone);
    const result = await request.query('SELECT * FROM Users WHERE Phone = @phone');
    return result.recordset[0];
};

const createUser = async (userData) => {
    const { password, fullName, email, phone, address } = userData;
    const request = new sql.Request();

    request.input('roleId', sql.Int, 4);
    request.input('password', sql.VarChar, password);
    request.input('fullName', sql.NVarChar, fullName);
    request.input('email', sql.VarChar, email);
    request.input('phone', sql.VarChar, phone);
    request.input('address', sql.NVarChar, address);

    await request.query(`
        INSERT INTO Users (RoleID, Password, FullName, Email, Phone, Address, IsActive, CreatedAt)
        VALUES (@roleId, @password, @fullName, @email, @phone, @address, 1, GETDATE())
    `);
};

const getUserById = async (userId) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    const result = await request.query('SELECT * FROM Users WHERE UserID = @userId');
    return result.recordset[0];
};

const updateUserProfile = async (userId, data) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, parseInt(userId));
    request.input('fullName', sql.NVarChar, data.fullName);
    request.input('phone', sql.VarChar, data.phone);
    request.input('address', sql.NVarChar, data.address);

    await request.query(`
        UPDATE Users
        SET FullName = @fullName, Phone = @phone, Address = @address
        WHERE UserID = @userId
    `);
};

const changePassword = async (userId, newPassword) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, parseInt(userId));
    request.input('newPassword', sql.VarChar, newPassword);

    await request.query(`
        UPDATE Users
        SET Password = @newPassword
        WHERE UserID = @userId
    `);
};

const updateAvatar = async (userId, avatarUrl) => {
    const request = new sql.Request();
    request.input('userId', sql.Int, parseInt(userId));
    request.input('avatarUrl', sql.VarChar, avatarUrl);

    await request.query(`
        UPDATE Users
        SET AvatarURL = @avatarUrl
        WHERE UserID = @userId
    `);
};

module.exports = { findUserByEmail, findUserByPhone, createUser, getUserById, updateUserProfile, changePassword, updateAvatar };