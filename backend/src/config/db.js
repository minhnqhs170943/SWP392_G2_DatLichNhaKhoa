const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'master',
  options: {
    encrypt: (process.env.DB_ENCRYPT || 'true').toLowerCase() === 'true',
    trustServerCertificate: (process.env.DB_TRUST_SERVER_CERT || 'true').toLowerCase() === 'true'
  },
  port: Number(process.env.DB_PORT) || 1433
};

async function connectDB() {
  try {
    const pool = await sql.connect(config);
    console.log("Kết nối SQL Server thành công!");
    return pool;
  } catch (err) {
    console.error("Lỗi kết nối chi tiết: ", err.message);
    throw err;
  }
}

async function getPool() {
  return connectDB();
}

module.exports = { sql, connectDB, getPool };
