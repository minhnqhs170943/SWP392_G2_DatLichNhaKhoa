const { poolPromise } = require('../config/db');

// Controller for Staff Dashboard - Hỗ trợ lọc theo tháng/năm
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;

        // Lấy query params lọc, mặc định = năm hiện tại
        const filterMonth = req.query.month ? parseInt(req.query.month) : null; // null = tất cả tháng
        const filterYear = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        // 1. Tổng số bệnh nhân
        const patientsResult = await pool.request().query(`
            SELECT COUNT(*) AS TotalPatients 
            FROM Users u
            JOIN Roles r ON u.RoleID = r.RoleID
            WHERE r.RoleName = 'Patient' AND u.IsActive = 1
        `);
        const totalPatients = patientsResult.recordset[0].TotalPatients;

        // 2. Tổng doanh thu (theo năm + tháng nếu có)
        let revenueQuery = `
            SELECT ISNULL(SUM(p.Amount), 0) AS TotalRevenue 
            FROM Payments p
            WHERE p.Status = 'Completed' AND YEAR(p.PaymentDate) = @year
        `;
        if (filterMonth) {
            revenueQuery += ` AND MONTH(p.PaymentDate) = @month`;
        }
        const revenueRequest = pool.request().input('year', filterYear);
        if (filterMonth) revenueRequest.input('month', filterMonth);
        const revenueResult = await revenueRequest.query(revenueQuery);
        const totalRevenue = revenueResult.recordset[0].TotalRevenue;

        // 3. Số lịch hẹn (theo tháng+năm hoặc hôm nay nếu không lọc)
        let appointmentCountQuery;
        if (filterMonth) {
            appointmentCountQuery = `
                SELECT COUNT(*) AS CountAppointments 
                FROM Appointments
                WHERE MONTH(AppointmentDate) = @month AND YEAR(AppointmentDate) = @year
            `;
        } else {
            appointmentCountQuery = `
                SELECT COUNT(*) AS CountAppointments 
                FROM Appointments
                WHERE AppointmentDate = CAST(GETDATE() AS DATE)
            `;
        }
        const appointmentCountReq = pool.request().input('year', filterYear);
        if (filterMonth) appointmentCountReq.input('month', filterMonth);
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

        // 6. Top dịch vụ sử dụng - theo tháng + năm (qua AppointmentServices)
        let servicesQuery = `
            SELECT TOP 5
                s.ServiceName as name,
                COUNT(aps.ServiceID) as value
            FROM Appointments a
            JOIN AppointmentServices aps ON a.AppointmentID = aps.AppointmentID
            JOIN Services s ON aps.ServiceID = s.ServiceID
            WHERE YEAR(a.AppointmentDate) = @year
        `;
        if (filterMonth) servicesQuery += ` AND MONTH(a.AppointmentDate) = @month`;
        servicesQuery += ` GROUP BY s.ServiceName ORDER BY value DESC`;

        const servicesReq = pool.request().input('year', filterYear);
        if (filterMonth) servicesReq.input('month', filterMonth);
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
                topServices,
                topDoctors,
                filterMonth,
                filterYear
            }
        });

    } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
        res.status(500).json({ success: false, message: "Lỗi server" });
    }
};
