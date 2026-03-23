import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdPeople, MdWork, MdVerifiedUser, MdSchedule } from 'react-icons/md';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClients: 0,
        totalFreelancers: 0,
        pendingVerifications: 0,
        totalJobs: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    // Data for charts
    const userRoleData = [
        { name: 'Clients', value: stats.totalClients },
        { name: 'Freelancers', value: stats.totalFreelancers },
    ];

    const jobStatusData = [
        { name: 'Total Jobs', count: stats.totalJobs },
        { name: 'Pending Verifications', count: stats.pendingVerifications },
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Overview of system activity</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.totalUsers}</h3>
                            <p className="text-gray-500 text-sm">Total Users</p>
                        </div>
                        <div className="stat-card-icon stat-icon-blue">
                            <MdPeople size={28} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.pendingVerifications}</h3>
                            <p className="text-gray-500 text-sm">Pending Verifications</p>
                        </div>
                        <div className="stat-card-icon stat-icon-red">
                            <MdSchedule size={28} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.totalFreelancers}</h3>
                            <p className="text-gray-500 text-sm">Freelancers</p>
                        </div>
                        <div className="stat-card-icon stat-icon-green">
                            <MdVerifiedUser size={28} />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.totalJobs}</h3>
                            <p className="text-gray-500 text-sm">Total Jobs Posted</p>
                        </div>
                        <div className="stat-card-icon stat-icon-purple">
                            <MdWork size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h2>User Distribution</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={userRoleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userRoleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h2>System Overview</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={jobStatusData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#A41F39" barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;