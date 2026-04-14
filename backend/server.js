const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const rootRoutes = require('./src/routes/index');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', rootRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
