require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const rootRoutes = require('./src/routes/index');
const initReminderJob = require('./src/jobs/reminderJob');

const app = express();
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.use('/api', rootRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Lỗi hệ thống:', err.stack); 
  res.status(500).json({ 
      success: false,
      message: 'Đã có lỗi xảy ra từ phía máy chủ',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    initReminderJob();
});
