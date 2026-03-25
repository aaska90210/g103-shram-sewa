import { FileText, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyApplications = () => {
    // === State Management ===
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // === Fetch Applications on Mount ===
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login first');
                setLoading(false);
                return;
            }

            // Fetch worker's applications from backend
            const response = await axios.get(
                'http://localhost:5000/api/jobs/my-applications',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error(error.response?.data?.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    // === Format Date ===
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // === Format Budget ===
    const formatBudget = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    // === View Application Details ===
    const handleView = (application) => {
        const details = `
Job: ${application.jobTitle}
Client: ${application.client}
Location: ${application.location}
Budget: ${formatBudget(application.budget)}
Applied: ${formatDate(application.appliedAt)}
Status: ${application.status}
Job Status: ${application.jobStatus}
        `.trim();
        
        toast.info(details);
    };

    return (
        <div>
            {/* === Page Header === */}
            <div className="page-header">
                <h1>My Applications</h1>
                <p>Track the status of jobs you have applied for.</p>
            </div>

            {/* === Applications Table === */}
            <div className="table-card">
                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <p>Loading applications...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <FileText size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
                            <p>No applications yet. Start by browsing available jobs!</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Client Name</th>
                                    <th>Location</th>
                                    <th>Offered Rate</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id}>
                                        <td className="table-cell-bold">{app.jobTitle}</td>
                                        <td>{app.client}</td>
                                        <td>{app.location}</td>
                                        <td className="table-cell-bold">{formatBudget(app.budget)}</td>
                                        <td>{formatDate(app.appliedAt)}</td>
                                        <td>
                                            {/* Status badges with different colors */}
                                            <span className={`badge ${
                                                app.status === 'Approved' ? 'badge-green' :
                                                app.status === 'Pending' ? 'badge-yellow' : 'badge-red'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="action-btn action-btn-red"
                                                    title="View Details"
                                                    onClick={() => handleView(app)}
                                                >
                                                    <Eye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* === Application Stats === */}
            <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Total Applications</p>
                            <h3>{applications.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Approved</p>
                            <h3>{applications.filter(a => a.status === 'Approved').length}</h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Pending</p>
                            <h3>{applications.filter(a => a.status === 'Pending').length}</h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Rejected</p>
                            <h3>{applications.filter(a => a.status === 'Rejected').length}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
