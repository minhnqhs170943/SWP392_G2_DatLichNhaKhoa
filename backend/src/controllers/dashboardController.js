const { poolPromise } = require('../config/db');

// Controller for Staff Dashboard - Hỗ trợ lọc theo tháng/năm
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        // Lấy query params lọc, mặc định = năm hiện tại
        const filterDay = req.query.day ? parseInt(req.query.day) : null;
        const filterMonth = req.query.month ? parseInt(req.query.month) : null; // null = tất cả tháng
        const filterYear = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        // 1. Tổng số bệnh nhân
        const patientsResult = await pool.request().query(`
            SELECT COUNT(*) AS TotalPatients 
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE (r.RoleName = 'Patient' OR r.RoleName = 'User') AND u.IsActive = 1
        `);
        const totalPatients = patientsResult.recordset[0].TotalPatients;

        let revenueQuery = `
            SELECT ISNULL(SUM(p.Amount), 0) AS TotalRevenue 
            FROM Payments p
            WHERE p.Status = 'Completed' AND YEAR(p.PaymentDate) = @year
        `;
        if (filterMonth) revenueQuery += ` AND MONTH(p.PaymentDate) = @month`;
        if (filterDay) revenueQuery += ` AND DAY(p.PaymentDate) = @day`;

        const revenueRequest = pool.request().input('year', filterYear);
        if (filterMonth) revenueRequest.input('month', filterMonth);
        if (filterDay) revenueRequest.input('day', filterDay);
        const revenueResult = await revenueRequest.query(revenueQuery);
        const totalRevenue = revenueResult.recordset[0].TotalRevenue;

        // 3. Số lịch hẹn
        let appointmentCountQuery = `
            SELECT COUNT(*) AS CountAppointments 
            FROM Appointments
            WHERE YEAR(AppointmentDate) = @year
        `;
        if (filterMonth) appointmentCountQuery += ` AND MONTH(AppointmentDate) = @month`;
        if (filterDay) appointmentCountQuery += ` AND DAY(AppointmentDate) = @day`;
        
        // Nếu không có bất kỳ filter nào, mặc định là hôm nay như cũ
        if (!filterMonth && !filterYear && !filterDay) {
            appointmentCountQuery = `
                SELECT COUNT(*) AS CountAppointments 
                FROM Appointments
                WHERE CAST(AppointmentDate AS DATE) = CAST(GETDATE() AS DATE)
            `;
        }

        const appointmentCountReq = pool.request().input('year', filterYear);
        if (filterMonth) appointmentCountReq.input('month', filterMonth);
        if (filterDay) appointmentCountReq.input('day', filterDay);
        const appointmentCountResult = await appointmentCountReq.query(appointmentCountQuery);
        const countAppointments = appointmentCountResult.recordset[0].CountAppointments;

        // === CÁC QUERY CHO BIỂU ĐỒ ===

        // 4. Thống kê Doanh thu theo tháng (Bar Chart) - theo năm đã chọn
        const revenueByMonthResult = await pool.request()
            .input('year', filterYear)
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

        // 5. Trạng thái lịch hẹn (Pie Chart) - theo tháng + năm
        let statusQuery = `
            SELECT Status as name, COUNT(*) as value
            FROM Appointments
            WHERE YEAR(AppointmentDate) = @year
        `;
        if (filterMonth) statusQuery += ` AND MONTH(AppointmentDate) = @month`;
        statusQuery += ` GROUP BY Status`;

        const statusReq = pool.request().input('year', filterYear);
        if (filterMonth) statusReq.input('month', filterMonth);
        const appointmentStatusResult = await statusReq.query(statusQuery);
        const appointmentsStatus = appointmentStatusResult.recordset;

        // 5.5 Thống kê Lịch hẹn theo ngày (Line Chart) - theo tháng + năm
        // Nếu không có tháng cụ thể, mặc định lấy tháng hiện tại để biểu đồ không bị trống
        const statsMonth = filterMonth || (new Date().getMonth() + 1);
        const appointmentsByDayResult = await pool.request()
            .input('month', statsMonth)
            .input('year', filterYear)
            .query(`
                SELECT 
                    DAY(AppointmentDate) as dayNum,
                    COUNT(*) as value
                FROM Appointments
                WHERE MONTH(AppointmentDate) = @month AND YEAR(AppointmentDate) = @year
                GROUP BY DAY(AppointmentDate)
                ORDER BY dayNum ASC
            `);
        const appointmentsByDay = appointmentsByDayResult.recordset.map(item => ({
            name: 'Ngày ' + item.dayNum,
            value: item.value
        }));

        // 6. Top dịch vụ sử dụng - theo tháng + năm + ngày
        let servicesQuery = `
            SELECT TOP 5
                s.ServiceName as name,
                COUNT(s.ServiceID) as value
            FROM Appointments a
            JOIN Services s ON a.AppointmentID = s.AppointmentID
            WHERE YEAR(a.AppointmentDate) = @year 
            AND a.Status <> 'Cancelled'
        `;
        if (filterMonth) servicesQuery += ` AND MONTH(a.AppointmentDate) = @month`;
        if (filterDay) servicesQuery += ` AND DAY(a.AppointmentDate) = @day`;
        servicesQuery += ` GROUP BY s.ServiceName ORDER BY value DESC`;

        const servicesReq = pool.request().input('year', filterYear);
        if (filterMonth) servicesReq.input('month', filterMonth);
        if (filterDay) servicesReq.input('day', filterDay);
        const topServicesResult = await servicesReq.query(servicesQuery);
        const topServices = topServicesResult.recordset;

        // 7. Tần suất bác sĩ khám - theo tháng + năm (Doctors JOIN Users để lấy FullName)
        let doctorsQuery = `
            SELECT 
                u.FullName as name,
                COUNT(a.AppointmentID) as value
            FROM Appointments a
            JOIN Doctors d ON a.DoctorID = d.DoctorID
            JOIN Users u ON d.UserID = u.UserID
            WHERE YEAR(a.AppointmentDate) = @year
        `;
        if (filterMonth) doctorsQuery += ` AND MONTH(a.AppointmentDate) = @month`;
        doctorsQuery += ` GROUP BY u.FullName ORDER BY value DESC`;

        const doctorsReq = pool.request().input('year', filterYear);
        if (filterMonth) doctorsReq.input('month', filterMonth);
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
                filterDay,
                filterMonth,
                filterYear
            }
        });

    } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
