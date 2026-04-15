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

const poolPromise = new sql.ConnectionPool(config)
  .connect()
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
