const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'nam123',
  server: 'localhost',
  database: 'master', // Thay bằng tên DB thực tế của bạn sau này
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  port: 57302 // Hardcode cổng động tạm thời
};

async function connectDB() {
  try {
    // Thêm dòng này để kiểm tra pool đã tồn tại chưa (tránh tạo nhiều kết nối)
    let pool = await sql.connect(config);
    console.log("Kết nối SQL Server thành công!");
    return pool;
  } catch (err) {
    console.error("Lỗi kết nối chi tiết: ", err.message);
  }
}

module.exports = { sql, connectDB };