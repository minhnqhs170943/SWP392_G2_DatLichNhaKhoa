require('dotenv').config();
const { sql, connectDB } = require('./src/config/db');
async function test() {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Roles');
        console.table(result.recordset);
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
