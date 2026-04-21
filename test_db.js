const { sql, connectDB } = require('./backend/src/config/db');
async function test() {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT * FROM Roles');
    console.log(result.recordset);
    process.exit(0);
}
test();
