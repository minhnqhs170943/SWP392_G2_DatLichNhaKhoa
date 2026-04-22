require('dotenv').config();
const { connectDB } = require('./src/config/db');
connectDB().then(() => {
    console.log("DB connected");
    process.on('exit', (code) => console.log('Process exiting with code', code));
    setTimeout(() => console.log("Timeout"), 10000);
});
