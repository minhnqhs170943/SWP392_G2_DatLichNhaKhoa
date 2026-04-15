import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Users, CreditCard, Activity } from 'lucide-react';
import './AdminAnalytics.css';

const PIE_COLORS = ['#4318ff', '#6ad2ff', '#05cd99', '#ffb547'];

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/admin/analytics/overview');
                const data = await response.json();
                if (data.success) {
                    setAnalytics(data.payload);
                }
            } catch (error) {
                console.error('System Analytics fetch failed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading || !analytics) {
        return (
            <div className="admin-dashboard d-flex align-items-center justify-content-center">
                <h3>Loading System Metrics...</h3>
            </div>
        );
    }

    const { kpis, charts, audit } = analytics;

    return (
        <div className="admin-dashboard">
            {/* Board Header */}
            <div className="admin-header">
                <h1>Board of Directors Dashboard</h1>
                <p>Enterprise Financial & Performance Metrics</p>
            </div>

            {/* Top KPI Widgets */}
            <div className="row">
                <div className="col-lg-4 col-md-6">
                    <div className="admin-kpi-card">
                        <div className="kpi-icon-wrapper revenue">
                            <CreditCard />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Gross Revenue (YTD)</span>
                            <span className="kpi-value">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis.grossRevenue)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4 col-md-6">
                    <div className="admin-kpi-card">
                        <div className="kpi-icon-wrapper patients">
                            <Users />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Total Unique Patients</span>
                            <span className="kpi-value">{kpis.totalPatients}</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 col-md-6">
                    <div className="admin-kpi-card">
                        <div className="kpi-icon-wrapper appointments">
                            <Activity />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Appointments Fill Rate</span>
                            <span className="kpi-value">
                                {Math.round((kpis.appointmentStats.CompletedAppointments / kpis.appointmentStats.TotalAppointments) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphics Row 1 */}
            <div className="row">
                <div className="col-lg-8">
                    <div className="admin-data-card" style={{ height: '420px' }}>
                        <div className="admin-data-title">Revenue Growth (Current Year)</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={charts.revenueTrend} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4318ff" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4318ff" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#a3aed1" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#a3aed1" tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#2b3674', color: 'white', borderRadius: '10px', padding: '15px', border: 'none' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#4318ff" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="admin-data-card" style={{ height: '420px' }}>
                        <div className="admin-data-title">Revenue by Payout Method</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={charts.paymentMethods}
                                    cx="50%" cy="45%"
                                    innerRadius={70} outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="volume"
                                    stroke="none"
                                >
                                    {charts.paymentMethods.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Graphics Row 2 */}
            <div className="row">
                <div className="col-lg-5">
                    <div className="admin-data-card" style={{ height: '400px' }}>
                        <div className="admin-data-title">Doctor Yield Contribution</div>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={charts.revenueByDoctor} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="#a3aed1" tick={{fontSize: 13, fontWeight: 600}} axisLine={false} tickLine={false} />
                                <RechartsTooltip cursor={{fill: '#f4f7fe'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#6ad2ff" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="admin-data-card" style={{ height: 'auto', minHeight: '400px' }}>
                        <div className="admin-data-title">Service Profitability Audit</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="service-table">
                                <thead>
                                    <tr>
                                        <th>Service Name</th>
                                        <th>Unit Price</th>
                                        <th>Usage Count</th>
                                        <th>Total Yield</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {audit.serviceProfitability.map((srv, idx) => (
                                        <tr key={idx}>
                                            <td>{srv.ServiceName}</td>
                                            <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(srv.UnitPrice)}</td>
                                            <td>{srv.UsageCount}</td>
                                            <td className="currency-text">+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(srv.TotalYield)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
