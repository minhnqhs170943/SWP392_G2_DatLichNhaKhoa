require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');

const app = express();

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');

// Khởi tạo middleware
app.use(cors());
app.use(express.json());

// Kết nối với CSDL SQL Server
connectDB();

app.get('/', (req, res) => res.send('API Running'));

// Khai báo Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
