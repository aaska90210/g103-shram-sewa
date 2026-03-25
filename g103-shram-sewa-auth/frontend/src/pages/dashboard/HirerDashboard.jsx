import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Custom Nepali Rupees Icon Component
const NepaliRupeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₨</text>
    </svg>
);

const HirerDashboard = () => {
    // State for real-time data
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Total Jobs Posted', value: 0, icon: Briefcase, colorClass: 'stat-icon-blue' },
        { label: 'Active Jobs', value: 0, icon: Clock, colorClass: 'stat-icon-red' },
        { label: 'Completed Jobs', value: 0, icon: CheckCircle, colorClass: 'stat-icon-green' },
        { label: 'Total Spent', value: 'Rs. 0', icon: NepaliRupeeIcon, colorClass: 'stat-icon-purple' },
    ]);

    // Fetch jobs from backend
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

            // Fetch user's jobs
            const response = await axios.get(
                'http://localhost:5000/api/jobs/my-jobs',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const jobsData = response.data;
            setJobs(jobsData);

            // Calculate statistics
            const totalJobs = jobsData.length;
            const activeJobs = jobsData.filter(job => job.status === 'Active').length;
            const completedJobs = jobsData.filter(job => job.status === 'Completed').length;
            const totalSpent = jobsData
                .filter(job => job.status === 'Completed')
                .reduce((sum, job) => sum + job.budget, 0);

            // Update stats
            setStats([
                { label: 'Total Jobs Posted', value: totalJobs, icon: Briefcase, colorClass: 'stat-icon-blue' },
                { label: 'Active Jobs', value: activeJobs, icon: Clock, colorClass: 'stat-icon-red' },
                { label: 'Completed Jobs', value: completedJobs, icon: CheckCircle, colorClass: 'stat-icon-green' },
                { label: 'Total Spent', value: `Rs. ${totalSpent.toLocaleString('en-IN')}`, icon: NepaliRupeeIcon, colorClass: 'stat-icon-purple' },
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
            setLoading(false);
        }
    };

    // Generate chart data from real jobs
    const generateChartData = () => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months = [];

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            last6Months.push({
                month: monthNames[monthIndex],
                jobs: 0
            });
        }

        // Count jobs by month
        jobs.forEach(job => {
            const jobMonth = new Date(job.createdAt).getMonth();
            const jobYear = new Date(job.createdAt).getFullYear();
            const currentYear = new Date().getFullYear();

            if (jobYear === currentYear) {
                const monthIndex = last6Months.findIndex(m => m.month === monthNames[jobMonth]);
                if (monthIndex !== -1) {
                    last6Months[monthIndex].jobs++;
                }
            }
        });

        return last6Months;
    };

    // Generate category data from real jobs
    const generateCategoryData = () => {
        const categories = {};

        jobs.forEach(job => {
            if (categories[job.category]) {
                categories[job.category]++;
            } else {
                categories[job.category] = 1;
            }
        });

        return Object.keys(categories).map(category => ({
            category,
            count: categories[category]
        }));
    };

    // Format date to relative time
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    };

    const hiringOverviewData = generateChartData();
    const jobCategoriesData = generateCategoryData();
    const recentJobs = jobs.slice(0, 4); // Show only last 4 jobs
    return (
        <div>
            {/* === Page Header === */}
            {/* Top section with title and welcome message */}
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back! Here's your hiring overview.</p>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading dashboard data...</p>
                </div>
            ) : (
                <>
                    {/* === Stats Row === */}
                    {/* Four horizontal cards displaying key metrics with colored icons */}
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
                    {/* Two side-by-side charts: Hiring Overview (Line) and Job Categories (Bar) */}
                    <div className="charts-grid">
                        {/* Left chart: Hiring Overview - Shows activity trends over time */}
                        <div className="chart-card">
                            <h2>Hiring Overview</h2>
                            {hiringOverviewData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={hiringOverviewData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="jobs" stroke="#A41F39" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: '#9CA3AF' }}>No data to display</p>
                                </div>
                            )}
                        </div>

                        {/* Right chart: Job Categories - Shows distribution by job type */}
                        <div className="chart-card">
                            <h2>Job Categories</h2>
                            {jobCategoriesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={jobCategoriesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="category" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#A41F39" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ color: '#9CA3AF' }}>No data to display</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* === Recent Activity Table === */}
                    {/* Professional table showing latest job postings with colored status badges */}
                    <div className="table-card">
                        <div className="table-card-header">
                            <h2>Recent Job Postings</h2>
                        </div>
                        <div className="table-wrapper">
                            {recentJobs.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Applicants</th>
                                            <th>Posted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentJobs.map((job) => (
                                            <tr key={job._id}>
                                                <td className="table-cell-bold">{job.title}</td>
                                                <td>{job.category}</td>
                                                <td>
                                                    {/* Colored badges: Green for Active, Blue for Completed, Yellow for Pending */}
                                                    <span className={`badge ${
                                                        job.status === 'Active' ? 'badge-green' : 
                                                        job.status === 'Completed' ? 'badge-blue' : 'badge-yellow'
                                                    }`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="table-cell-bold">{job.applicants?.length || 0}</td>
                                                <td>{formatDate(job.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <p style={{ color: '#9CA3AF' }}>No jobs posted yet. Start by posting your first job!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HirerDashboard;
