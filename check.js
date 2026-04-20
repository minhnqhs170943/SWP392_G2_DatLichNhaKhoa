const { sql, connectDB } = require('./backend/src/config/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const pool = await connectDB();
        const r = await pool.request().query('SELECT COUNT(*) as c FROM Users');
        console.log('Total Users:', r.recordset[0].c);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
check();
