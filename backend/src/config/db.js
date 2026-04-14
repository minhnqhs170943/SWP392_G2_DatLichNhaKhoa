const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: parseInt(process.env.DB_PORT)
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("Kết nối SQL Server thành công");
    } catch (err) {
        console.error("Lỗi kết nối:", err);
    }
};

module.exports = { sql, connectDB, poolPromise };
