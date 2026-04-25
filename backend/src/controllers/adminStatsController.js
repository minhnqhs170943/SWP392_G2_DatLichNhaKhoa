const { poolPromise } = require('../config/db');

class AdminStatsController {
    /**
     * @route   GET /api/admin/analytics/overview
     * @desc    Get high-level summary and detailed analytics for Admin Board
     * @access  Private/Admin
     */
    static async getComprehensiveAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const pool = await poolPromise;
            
            let dateFilter = '';
            const request = pool.request();
            if (startDate && endDate) {
                dateFilter = 'AND a.AppointmentDate >= @startDate AND a.AppointmentDate <= @endDate';
                request.input('startDate', startDate);
                request.input('endDate', endDate);
            }

            // 1. KPI: Total Patients (attended / completed appointments)
            const userMetrics = await request.query(`
                SELECT COUNT(DISTINCT a.PatientID) as TotalPatients
                FROM Appointments a
                WHERE a.Status = 'Completed' ${dateFilter}
            `);

            // 2. KPI: Gross Revenue
            let revenueDateFilter = '';
            if (startDate && endDate) {
                revenueDateFilter = 'AND p.PaymentDate >= @startDate AND p.PaymentDate <= @endDate';
            }
            const revenueMetrics = await request.query(`
                SELECT ISNULL(SUM(Amount), 0) as GrossRevenue
                FROM Payments p
                WHERE Status = 'Completed' ${revenueDateFilter}
            `);

            // 3. KPI: Appointment Stats
            const appointmentFilter = startDate && endDate ? 'WHERE AppointmentDate >= @startDate AND AppointmentDate <= @endDate' : '';
            const appointmentMetrics = await request.query(`
                SELECT
                    COUNT(*) as TotalAppointments,
                    SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as CompletedAppointments,
                    SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) as CancelledAppointments
                FROM Appointments
                ${appointmentFilter}
            `);

            // 4. CHART: Revenue by Doctor
            const revenueByDoctor = await request.query(`
                SELECT
                    u.FullName as DoctorName,
                    ISNULL(SUM(p.Amount), 0) as Revenue
                FROM Doctors d
                JOIN Users u ON d.UserID = u.UserID
                LEFT JOIN Appointments a ON d.DoctorID = a.DoctorID
                LEFT JOIN Invoices inv ON a.AppointmentID = inv.AppointmentID
                LEFT JOIN Payments p ON inv.InvoiceID = p.InvoiceID AND p.Status = 'Completed' ${revenueDateFilter}
                GROUP BY u.FullName
                ORDER BY Revenue DESC
            `);

            // 5. CHART: Payment Methods Distribution
            const paymentMethods = await request.query(`
                SELECT
                    PaymentMethod as Method,
                    COUNT(PaymentID) as Transactions,
                    ISNULL(SUM(Amount), 0) as TotalVolume
                FROM Payments p
                WHERE Status = 'Completed' ${revenueDateFilter}
                GROUP BY PaymentMethod
            `);

            // 6. CHART: Revenue Trend (Current Year or Selected Date Range Year)
            const yearCondition = startDate && endDate ? 'YEAR(p.PaymentDate) = YEAR(@startDate)' : 'YEAR(p.PaymentDate) = YEAR(GETDATE())';
            const revenueTrend = await request.query(`
                SELECT
                    MONTH(p.PaymentDate) as MonthIdx,
                    ISNULL(SUM(p.Amount), 0) as Revenue
                FROM Payments p
                WHERE p.Status = 'Completed' AND ${yearCondition}
                GROUP BY MONTH(p.PaymentDate)
                ORDER BY MonthIdx ASC
            `);

            // 7. TABLE: Service Profitability
            // 7. TABLE: Service Profitability (ĐÃ FIX LỖI JOIN BẢNG)
            const serviceProfitability = await request.query(`
                SELECT 
                    s.ServiceName, 
                    MAX(s.Price) as UnitPrice,
                    SUM(CASE WHEN a.AppointmentID IS NOT NULL THEN 1 ELSE 0 END) as UsageCount,
                    ISNULL(SUM(CASE WHEN a.AppointmentID IS NOT NULL AND inv.Status = 'Paid' THEN aps.PriceAtBooking ELSE 0 END), 0) as TotalYield
                FROM Services s
                LEFT JOIN AppointmentServices aps ON s.ServiceID = aps.ServiceID
                LEFT JOIN Appointments a ON aps.AppointmentID = a.AppointmentID AND a.Status = 'Completed' ${dateFilter}
                LEFT JOIN Invoices inv ON a.AppointmentID = inv.AppointmentID
                GROUP BY s.ServiceName
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
