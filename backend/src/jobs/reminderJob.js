const cron = require('node-cron');
const { sql, poolPromise } = require('../config/db');
const { sendMail } = require('../config/mailer');

const initReminderJob = () => {
    // Cấu trúc: phút giờ ngày tháng thứ_trong_tuần
    cron.schedule('0 8 * * *', async () => {
        console.log("--- Bắt đầu quét lịch tái khám ---");
        
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT u.Email, u.FullName, a.FollowUpDate, a.FollowUpNote
                FROM Appointments a
                JOIN Users u ON a.PatientID = u.UserID
                WHERE a.Status = 'Completed' 
                  AND a.FollowUpDate IS NOT NULL
                  AND DATEDIFF(day, GETDATE(), a.FollowUpDate) BETWEEN 0 AND 7
            `);

            for (const row of result.recordset) {
                const html = `
                    <h3>Nhắc nhở lịch hẹn tái khám</h3>
                    <p>Chào ${row.FullName},</p>
                    <p>Bạn có lịch tái khám vào ngày <b>${new Date(row.FollowUpDate).toLocaleDateString('vi-VN')}</b>.</p>
                    <p>Nội dung: ${row.FollowUpNote || 'Khám định kỳ'}</p>
                    <p>Hẹn gặp lại bạn!</p>
                `;
                await sendMail(row.Email, "[Nhắc nhở] Lịch tái khám sắp tới", html);
            }
            console.log(`Đã nhắc nhở ${result.recordset.length} bệnh nhân.`);
        } catch (err) {
            console.error("Lỗi Cron Job:", err);
        }
    });
};

module.exports = initReminderJob;