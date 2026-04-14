const { poolPromise } = require('../config/db');

exports.getAllAppointments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT a.AppointmentID, u.FullName AS PatientName, u.Phone AS PatientPhone, d.FullName AS DoctorName, 
                   s.ServiceName, a.AppointmentDate, a.AppointmentTime, a.Status, a.Note
            FROM Appointments a
            JOIN Users u ON a.UserID = u.UserID
            LEFT JOIN Doctors d ON a.DoctorID = d.DoctorID
            LEFT JOIN Services s ON a.ServiceID = s.ServiceID
            ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp trạng thái mới." });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', id)
            .input('status', status)
            .query(`
                UPDATE Appointments 
                SET Status = @status, UpdatedAt = GETDATE()
                WHERE AppointmentID = @id
            `);

        res.json({
            success: true,
            message: "Cập nhật trạng thái thành công"
        });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái lịch hẹn:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
