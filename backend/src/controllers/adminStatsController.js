const { poolPromise } = require('../config/db');

class AdminStatsController {
    /**
     * @route   GET /api/admin/analytics/overview
     * @desc    Get high-level summary and detailed analytics for Admin Board
     * @access  Private/Admin
     */
    static async getComprehensiveAnalytics(req, res) {
        try {
            const pool = await poolPromise;

            // 1. KPI: Total Patients (attended / completed appointments)
            const userMetrics = await pool.request().query(`
                SELECT COUNT(DISTINCT a.PatientID) as TotalPatients
                FROM Appointments a
                WHERE a.Status = 'Completed'
            `);

            // 2. KPI: Gross Revenue
            const revenueMetrics = await pool.request().query(`
                SELECT ISNULL(SUM(Amount), 0) as GrossRevenue
                FROM Payments
                WHERE Status = 'Completed'
            `);

            // 3. KPI: Appointment Stats
            const appointmentMetrics = await pool.request().query(`
                SELECT
                    COUNT(*) as TotalAppointments,
                    SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as CompletedAppointments,
                    SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) as CancelledAppointments
                FROM Appointments
            `);

            // 4. CHART: Revenue by Doctor
            // Schema mới: Doctors.FullName -> Users.FullName qua Doctors.UserID
            // Payments -> Invoices -> Appointments -> Doctors
            const revenueByDoctor = await pool.request().query(`
                SELECT
                    u.FullName as DoctorName,
                    ISNULL(SUM(p.Amount), 0) as Revenue
                FROM Doctors d
                JOIN Users u ON d.UserID = u.UserID
                LEFT JOIN Appointments a ON d.DoctorID = a.DoctorID
                LEFT JOIN Invoices inv ON a.AppointmentID = inv.AppointmentID
                LEFT JOIN Payments p ON inv.InvoiceID = p.InvoiceID AND p.Status = 'Completed'
                GROUP BY u.FullName
                ORDER BY Revenue DESC
            `);

            // 5. CHART: Payment Methods Distribution
            const paymentMethods = await pool.request().query(`
                SELECT
                    PaymentMethod as Method,
                    COUNT(PaymentID) as Transactions,
                    ISNULL(SUM(Amount), 0) as TotalVolume
                FROM Payments
                WHERE Status = 'Completed'
                GROUP BY PaymentMethod
            `);

            // 6. CHART: Revenue Trend (Current Year)
            const revenueTrend = await pool.request().query(`
                SELECT
                    MONTH(PaymentDate) as MonthIdx,
                    ISNULL(SUM(Amount), 0) as Revenue
                FROM Payments
                WHERE Status = 'Completed' AND YEAR(PaymentDate) = YEAR(GETDATE())
                GROUP BY MONTH(PaymentDate)
                ORDER BY MonthIdx ASC
            `);

            // 7. TABLE: Service Profitability
            // Schema mới: AppointmentServices thay vì Appointments.ServiceID
            const serviceProfitability = await pool.request().query(`
                SELECT
                    s.ServiceName,
                    s.Price as UnitPrice,
                    COUNT(aps.AppointmentID) as UsageCount,
                    ISNULL(SUM(p.Amount), 0) as TotalYield
                FROM Services s
                LEFT JOIN AppointmentServices aps ON s.ServiceID = aps.ServiceID
                LEFT JOIN Appointments a ON aps.AppointmentID = a.AppointmentID AND a.Status = 'Completed'
                LEFT JOIN Invoices inv ON a.AppointmentID = inv.AppointmentID
                LEFT JOIN Payments p ON inv.InvoiceID = p.InvoiceID AND p.Status = 'Completed'
                GROUP BY s.ServiceName, s.Price
                ORDER BY TotalYield DESC
            `);

            return res.status(200).json({
                success: true,
                payload: {
                    kpis: {
                        totalPatients: userMetrics.recordset[0].TotalPatients,
                        grossRevenue: revenueMetrics.recordset[0].GrossRevenue,
                        appointmentStats: appointmentMetrics.recordset[0],
                    },
                    charts: {
                        revenueByDoctor: revenueByDoctor.recordset.map(r => ({ name: r.DoctorName, value: r.Revenue })),
                        paymentMethods: paymentMethods.recordset.map(r => ({ name: r.Method, volume: r.TotalVolume })),
                        revenueTrend: revenueTrend.recordset.map(r => ({ month: 'Tháng ' + r.MonthIdx, revenue: r.Revenue }))
                    },
                    audit: {
                        serviceProfitability: serviceProfitability.recordset
                    }
                }
            });

        } catch (error) {
            console.error('[AdminStatsController] Fatal Error:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error fetching admin statistics' });
        }
    }
}

module.exports = AdminStatsController;
