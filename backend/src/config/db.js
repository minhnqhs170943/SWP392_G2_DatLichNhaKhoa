// const sql = require('mssql');
// require('dotenv').config();

// const config = {
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     server: process.env.DB_SERVER,
//     database: process.env.DB_DATABASE || process.env.DB_NAME,
//     options: {
//         encrypt: true,
//         trustServerCertificate: true
//     },
//     port: parseInt(process.env.DB_PORT)
// };

// const connectDB = async () => {
//     try {
//         await sql.connect(config);
//         console.log("Kết nối SQL Server thành công");
//     } catch (err) {
//         console.error("Lỗi kết nối:", err);
//     }
// };

// module.exports = { sql, connectDB };

const sql = require('mssql');

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'master',
    options: {
        encrypt: (process.env.DB_ENCRYPT || 'true').toLowerCase() === 'true',
        trustServerCertificate: (process.env.DB_TRUST_SERVER_CERT || 'true').toLowerCase() === 'true'
    },
    port: Number(process.env.DB_PORT) || 1433
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log("Kết nối SQL Server thành công!");
        return pool;
    })
    .catch(err => {
        console.log("Lỗi kết nối chi tiết: ", err);
        process.exit(1);
    });

function connectDB() {
    return poolPromise;
}

module.exports = { sql, connectDB, poolPromise };
