const { poolPromise } = require('../config/db');

// Controller for Staff Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        // 1. Tổng số bệnh nhân
        const patientsResult = await pool.request().query(`
            SELECT COUNT(*) AS TotalPatients 
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE r.RoleName = 'Patient' AND u.IsActive = 1
        `);
        const totalPatients = patientsResult.recordset[0].TotalPatients;

        // 2. Tổng doanh thu (Năm nay)
        const revenueResult = await pool.request().query(`
            SELECT ISNULL(SUM(Amount), 0) AS TotalRevenue 
            FROM Payments
            WHERE Status = 'Completed' AND YEAR(PaymentDate) = YEAR(GETDATE())
        `);
        const totalRevenue = revenueResult.recordset[0].TotalRevenue;

        // 3. Số lịch hẹn hôm nay
        const todayAppointmentsResult = await pool.request().query(`
            SELECT COUNT(*) AS TodayAppointments 
            FROM Appointments
            WHERE AppointmentDate = CAST(GETDATE() AS DATE)
        `);
        const todayAppointments = todayAppointmentsResult.recordset[0].TodayAppointments;

        // 4. Danh sách các lịch hẹn đang chờ duyệt (Pending)
        const pendingAppointmentsResult = await pool.request().query(`
            SELECT a.AppointmentID, u.FullName AS PatientName, d.FullName AS DoctorName, 
                   s.ServiceName, a.AppointmentDate, a.AppointmentTime, a.Status, a.Note
            FROM Appointments a
            JOIN Users u ON a.UserID = u.UserID
            JOIN Doctors d ON a.DoctorID = d.DoctorID
            JOIN Services s ON a.ServiceID = s.ServiceID
            WHERE a.Status = 'Pending'
            ORDER BY a.AppointmentDate ASC, a.AppointmentTime ASC
        `);
        const pendingAppointments = pendingAppointmentsResult.recordset;

        // === CÁC QUERY CHO BIỂU ĐỒ ===

        // 5. Thống kê Doanh thu theo tháng (Bar Chart)
        const revenueByMonthResult = await pool.request().query(`
            SELECT 
                MONTH(PaymentDate) as monthNum,
                ISNULL(SUM(Amount), 0) as revenue
            FROM Payments
            WHERE Status = 'Completed' AND YEAR(PaymentDate) = YEAR(GETDATE())
            GROUP BY MONTH(PaymentDate)
            ORDER BY monthNum ASC
        `);
        const revenueByMonth = revenueByMonthResult.recordset.map(item => ({
            name: 'Tháng ' + item.monthNum,
            revenue: item.revenue
        }));

        // 6. Trạng thái lịch hẹn (Pie Chart)
        const appointmentStatusResult = await pool.request().query(`
            SELECT 
                Status as name,
                COUNT(*) as value
            FROM Appointments
            GROUP BY Status
        `);
        const appointmentsStatus = appointmentStatusResult.recordset;

        // 7. Top dịch vụ sử dụng (Line / Bar Chart)
        const topServicesResult = await pool.request().query(`
            SELECT TOP 5
                s.ServiceName as name,
                COUNT(a.ServiceID) as value
            FROM Appointments a
            JOIN Services s ON a.ServiceID = s.ServiceID
            GROUP BY s.ServiceName
            ORDER BY value DESC
        `);
        const topServices = topServicesResult.recordset;

        // 8. Tần suất bác sĩ khám (Thống kê bác sĩ)
        const topDoctorsResult = await pool.request().query(`
            SELECT 
                d.FullName as name,
                COUNT(a.AppointmentID) as value
            FROM Appointments a
            JOIN Doctors d ON a.DoctorID = d.DoctorID
            GROUP BY d.FullName
            ORDER BY value DESC
        `);
        const topDoctors = topDoctorsResult.recordset;

        // Trả kết quả
        res.json({
            success: true,
            data: {
                totalPatients,
                totalRevenue,
                todayAppointments,
                pendingAppointments,
                revenueByMonth,
                appointmentsStatus,
                topServices,
                topDoctors
            }
        });

    } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
