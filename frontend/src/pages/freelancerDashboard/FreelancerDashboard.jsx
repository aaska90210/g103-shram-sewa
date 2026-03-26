import { Briefcase, CheckCircle, FileText, Star } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// === Custom Nepali Rupees Icon ===
const NepaliRupeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₨</text>
    </svg>
);

const FreelancerDashboard = () => {
    // === State Management ===
    // Tracks all dashboard data
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState([
        { label: 'Total Earned', value: 'Rs. 0', icon: NepaliRupeeIcon, colorClass: 'stat-icon-purple' },
        { label: 'Jobs Completed', value: 0, icon: CheckCircle, colorClass: 'stat-icon-green' },
        { label: 'Active Applications', value: 0, icon: FileText, colorClass: 'stat-icon-blue' },
        { label: 'Profile Rating', value: '4.5 ★', icon: Star, colorClass: 'stat-icon-red' },
    ]);

    // === Chart Data State ===
    const [monthlyEarningsData, setMonthlyEarningsData] = useState([]);
    const [jobActivityData, setJobActivityData] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);

    // === Fetch Dashboard Data ===
    // Loads worker's statistics and applications from backend
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login first');
                setLoading(false);
                return;
            }

            // TODO: Implement actual API calls when backend routes are ready
            // For now, showing zero data until backend is connected
            setStats([
                { label: 'Total Earned', value: 'Rs. 0', icon: NepaliRupeeIcon, colorClass: 'stat-icon-purple' },
                { label: 'Jobs Completed', value: 0, icon: CheckCircle, colorClass: 'stat-icon-green' },
                { label: 'Active Applications', value: 0, icon: FileText, colorClass: 'stat-icon-blue' },
                { label: 'Profile Rating', value: '0 ★', icon: Star, colorClass: 'stat-icon-red' },
            ]);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
            setLoading(false);
        }
    };

    return (
        <div>
            {/* === Page Header === */}
            {/* Welcome message for the worker */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>Worker Dashboard</h1>
                    <p>Welcome back! Here's your work overview.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/worker/availability'}
                >
                    Manage Availability
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading dashboard data...</p>
                </div>
            ) : (
                <>
                    {/* === Stats Row === */}
                    {/* Four cards showing key worker metrics */}
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-card-content">
                                    <div className="stat-card-info">
                                        <p>{stat.label}</p>
                                        <h3>{stat.value}</h3>
                                    </div>
                                    <div className={`stat-card-icon ${stat.colorClass}`}>
                                        <stat.icon />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* === Charts Section === */}
                    {/* Two side-by-side charts for earnings and job activity */}
                    <div className="charts-grid">
                        {/* Monthly Earnings Bar Chart */}
                        <div className="chart-card">
                            <h2>Monthly Earnings</h2>
                            {monthlyEarningsData.length === 0 ? (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                                    No data to display
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={monthlyEarningsData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Bar dataKey="earnings" fill="#A41F39" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Jobs Found vs Applied Line Chart */}
                        <div className="chart-card">
                            <h2>Jobs Found vs. Applied</h2>
                            {jobActivityData.length === 0 ? (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                                    No data to display
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={jobActivityData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="found" stroke="#6B7280" strokeWidth={2} name="Found" />
                                        <Line type="monotone" dataKey="applied" stroke="#A41F39" strokeWidth={3} name="Applied" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* === Recent Applications Table === */}
                    {/* Shows the latest job applications with status */}
                    <div className="table-card">
                        <div className="table-card-header">
                            <h2>Recently Applied Jobs</h2>
                        </div>
                        <div className="table-wrapper">
                            {recentApplications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                                    <FileText size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
                                    <p>No applications yet. Start by browsing available jobs!</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Client Name</th>
                                            <th>Offered Rate</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentApplications.map((app) => (
                                            <tr key={app.id}>
                                                <td className="table-cell-bold">{app.jobTitle}</td>
                                                <td>{app.client}</td>
                                                <td className="table-cell-bold">{app.rate}</td>
                                                <td>
                                                    {/* Status badges: Green for Accepted, Yellow for Pending, Red for Rejected */}
                                                    <span className={`badge ${
                                                        app.status === 'Accepted' ? 'badge-green' :
                                                        app.status === 'Pending' ? 'badge-yellow' : 'badge-red'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FreelancerDashboard;
