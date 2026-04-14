require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');

const app = express();

const adminStatsRoutes = require('./src/routes/adminStatsRoutes');

// Khởi tạo middleware
app.use(cors());
app.use(express.json());

// Kết nối với CSDL SQL Server
connectDB();

app.get('/', (req, res) => res.send('API Running'));

// Khai báo Routes
app.use('/api/admin/analytics', adminStatsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));