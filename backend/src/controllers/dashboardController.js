const { poolPromise } = require('../config/db');

// Controller for Staff Dashboard - Hỗ trợ lọc theo tháng/năm
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        // Lấy query params lọc (startDate, endDate, year, month)
        let { startDate, endDate, year, month } = req.query;

        // Nếu có year/month mà không có startDate/endDate -> tự tính toán range
        if (year && !startDate && !endDate) {
            if (month) {
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);
                startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
                const lastDay = new Date(yearNum, monthNum, 0).getDate();
                endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`;
            } else {
                startDate = `${year}-01-01`;
                endDate = `${year}-12-31`;
            }
        }

        // 1. Tổng số bệnh nhân (Không lọc theo ngày vì là tổng số hệ thống)
        const patientsResult = await pool.request().query(`
            SELECT COUNT(*) AS TotalPatients 
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE (r.RoleName = 'Patient' OR r.RoleName = 'User') AND u.IsActive = 1
        `);
        const totalPatients = patientsResult.recordset[0].TotalPatients;

        // 2. Tổng doanh thu (Lọc theo range)
        let revenueQuery = `
            SELECT ISNULL(SUM(p.Amount), 0) AS TotalRevenue 
            FROM Payments p
            WHERE p.Status = 'Completed'
        `;
        if (startDate && endDate) {
            revenueQuery += ` AND CAST(p.PaymentDate AS DATE) BETWEEN @startDate AND @endDate`;
        }

        const revenueRequest = pool.request();
        if (startDate && endDate) {
            revenueRequest.input('startDate', startDate).input('endDate', endDate);
        }
        const revenueResult = await revenueRequest.query(revenueQuery);
        const totalRevenue = revenueResult.recordset[0].TotalRevenue;

        // 3. Số lịch hẹn (Lọc theo range)
        let appointmentCountQuery = `
            SELECT COUNT(*) AS CountAppointments 
            FROM Appointments
            WHERE Status <> 'Cancelled'
        `;
        if (startDate && endDate) {
            appointmentCountQuery += ` AND AppointmentDate BETWEEN @startDate AND @endDate`;
        } else {
            // Mặc định nếu không có range là hôm nay
            appointmentCountQuery += ` AND CAST(AppointmentDate AS DATE) = CAST(GETDATE() AS DATE)`;
        }

        const appointmentCountReq = pool.request();
        if (startDate && endDate) {
            appointmentCountReq.input('startDate', startDate).input('endDate', endDate);
        }
        const appointmentCountResult = await appointmentCountReq.query(appointmentCountQuery);
        const countAppointments = appointmentCountResult.recordset[0].CountAppointments;

        // === CÁC QUERY CHO BIỂU ĐỒ ===

        // 4. Thống kê Doanh thu theo tháng (Bar Chart) - Lấy theo năm của endDate hoặc năm hiện tại
        const reportYear = endDate ? new Date(endDate).getFullYear() : new Date().getFullYear();
        const revenueByMonthResult = await pool.request()
            .input('year', reportYear)
            .query(`
                SELECT 
                    MONTH(p.PaymentDate) as monthNum,
                    ISNULL(SUM(p.Amount), 0) as revenue
                FROM Payments p
                WHERE p.Status = 'Completed' AND YEAR(p.PaymentDate) = @year
                GROUP BY MONTH(p.PaymentDate)
                ORDER BY monthNum ASC
            `);
        const revenueByMonth = revenueByMonthResult.recordset.map(item => ({
            name: 'Tháng ' + item.monthNum,
            revenue: item.revenue
        }));

        // 5. Trạng thái lịch hẹn (Pie Chart) - Lọc theo range
        let statusQuery = `
            SELECT Status as name, COUNT(*) as value
            FROM Appointments
            WHERE 1=1
        `;
        if (startDate && endDate) {
            statusQuery += ` AND AppointmentDate BETWEEN @startDate AND @endDate`;
        }
        statusQuery += ` GROUP BY Status`;

        const statusReq = pool.request();
        if (startDate && endDate) {
            statusReq.input('startDate', startDate).input('endDate', endDate);
        }
        const appointmentStatusResult = await statusReq.query(statusQuery);
        const appointmentsStatus = appointmentStatusResult.recordset;

        // 5.5 Thống kê Lịch hẹn theo ngày (Line Chart) - Lọc theo range
        let dailyQuery = `
            SELECT 
                CONVERT(VARCHAR, AppointmentDate, 103) as dayLabel,
                COUNT(*) as value
            FROM Appointments
            WHERE 1=1
        `;
        if (startDate && endDate) {
            dailyQuery += ` AND AppointmentDate BETWEEN @startDate AND @endDate`;
        } else {
            // Mặc định 7 ngày gần nhất
            dailyQuery += ` AND AppointmentDate >= DATEADD(day, -7, GETDATE())`;
        }
        dailyQuery += ` GROUP BY AppointmentDate ORDER BY AppointmentDate ASC`;

        const dailyReq = pool.request();
        if (startDate && endDate) {
            dailyReq.input('startDate', startDate).input('endDate', endDate);
        }
        const appointmentsByDayResult = await dailyReq.query(dailyQuery);
        const appointmentsByDay = appointmentsByDayResult.recordset.map(item => ({
            name: item.dayLabel,
            value: item.value
        }));

        // 6. Top dịch vụ sử dụng - Lọc theo range
        let servicesQuery = `
            SELECT TOP 5
                s.ServiceName as name,
                COUNT(s.ServiceID) as value
            FROM Appointments a
            JOIN AppointmentServices aps ON a.AppointmentID = aps.AppointmentID
            JOIN Services s ON aps.ServiceID = s.ServiceID
            WHERE a.Status <> 'Cancelled'
        `;
        if (startDate && endDate) {
            servicesQuery += ` AND a.AppointmentDate BETWEEN @startDate AND @endDate`;
        }
        servicesQuery += ` GROUP BY s.ServiceName ORDER BY value DESC`;

        const servicesReq = pool.request();
        if (startDate && endDate) {
            servicesReq.input('startDate', startDate).input('endDate', endDate);
        }
        const topServicesResult = await servicesReq.query(servicesQuery);
        const topServices = topServicesResult.recordset;

        // 7. Tần suất bác sĩ khám - Lọc theo range
        let doctorsQuery = `
            SELECT 
                u.FullName as name,
                COUNT(a.AppointmentID) as value
            FROM Appointments a
            JOIN Doctors d ON a.DoctorID = d.DoctorID
            JOIN Users u ON d.UserID = u.UserID
            WHERE a.Status <> 'Cancelled'
        `;
        if (startDate && endDate) {
            doctorsQuery += ` AND a.AppointmentDate BETWEEN @startDate AND @endDate`;
        }
        doctorsQuery += ` GROUP BY u.FullName ORDER BY value DESC`;

        const doctorsReq = pool.request();
        if (startDate && endDate) {
            doctorsReq.input('startDate', startDate).input('endDate', endDate);
        }
        const topDoctorsResult = await doctorsReq.query(doctorsQuery);
        const topDoctors = topDoctorsResult.recordset;

        // Trả kết quả
        res.json({
            success: true,
            data: {
                totalPatients,
                totalRevenue,
                countAppointments,
                revenueByMonth,
                appointmentsStatus,
                appointmentsByDay,
                topServices,
                topDoctors,
                startDate,
                endDate
            }
        });

    } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
