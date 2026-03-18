import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, UserCheck, Clock } from 'lucide-react';
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
                            <p>Total Users</p>
                        </div>
                        <div className="stat-card-icon stat-icon-blue">
                            <Users />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.pendingVerifications}</h3>
                            <p>Pending Verifications</p>
                        </div>
                        <div className="stat-card-icon stat-icon-red">
                            <Clock />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.totalFreelancers}</h3>
                            <p>Freelancers</p>
                        </div>
                        <div className="stat-card-icon stat-icon-green">
                            <UserCheck />
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <h3>{stats.totalJobs}</h3>
                            <p>Total Jobs Posted</p>
                        </div>
                        <div className="stat-card-icon stat-icon-purple">
                            <Briefcase />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;