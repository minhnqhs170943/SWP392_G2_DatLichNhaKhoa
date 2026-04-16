const { sql } = require('../config/db');

const getAllServices = async () => {
    const request = new sql.Request();
    const result = await request.query('SELECT * FROM Services');
    return result.recordset;
};

module.exports = { getAllServices };