const { sql } = require('../config/db');

const findUserByEmail = async (email) => {
    const request = new sql.Request();
    request.input('email', sql.VarChar, email);
    const result = await request.query('SELECT * FROM Users WHERE Email = @email');
    return result.recordset[0];
};

module.exports = { findUserByEmail };