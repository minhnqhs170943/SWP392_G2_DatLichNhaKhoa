require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const rootRoutes = require('./src/routes/index');

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
const adminStatsRoutes = require('./src/routes/adminStatsRoutes');
const adminUserRoutes = require('./src/routes/adminUserRoutes');
connectDB();

// DEBUG - thêm sau dòng connectDB();
app.get('/test-db', async (req, res) => {
    try {
        const pool = await connectDB();
        const cols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'`);
        const roles = await pool.request().query('SELECT * FROM Roles');
        res.json({
            userColumns: cols.recordset.map(c => c.COLUMN_NAME),
            roles: roles.recordset
        });
    } catch (err) {
        res.json({ error: err.message });
    }
});


app.get('/', (req, res) => {
  res.send('Backend API is running');
});


app.use('/api', rootRoutes);

app.use('/api/admin/analytics', adminStatsRoutes);
app.use('/api/admin/users', adminUserRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
