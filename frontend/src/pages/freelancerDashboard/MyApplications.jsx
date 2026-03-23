import { FileText, Eye, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyApplications = () => {
    // === State Management ===
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);

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
        setSelectedApplication(application);
    };

    return (
        <div>
            {/* === View Application Modal === */}
            {selectedApplication && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Application Details</h3>
                            <button 
                                onClick={() => setSelectedApplication(null)}
                                className="modal-close"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                             <div className="modal-form-group">
                                <label className="modal-label">Job Title</label>
                                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                    {selectedApplication.jobTitle}
                                </p>
                             </div>

                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                 <div className="modal-form-group">
                                    <label className="modal-label">Client</label>
                                    <p style={{ margin: 0 }}>{selectedApplication.client}</p>
                                 </div>
                                 <div className="modal-form-group">
                                    <label className="modal-label">Location</label>
                                    <p style={{ margin: 0 }}>{selectedApplication.location}</p>
                                 </div>
                                 <div className="modal-form-group">
                                    <label className="modal-label">Budget</label>
                                    <p style={{ margin: 0, fontWeight: '600', color: '#A41F39' }}>
                                        {formatBudget(selectedApplication.budget)}
                                    </p>
                                 </div>
                                 <div className="modal-form-group">
                                    <label className="modal-label">Status</label>
                                    <span className={`badge ${
                                        selectedApplication.status === 'Approved' ? 'badge-green' :
                                        selectedApplication.status === 'Pending' ? 'badge-yellow' : 'badge-red'
                                    }`}>
                                        {selectedApplication.status}
                                    </span>
                                 </div>
                             </div>

                             <div className="modal-form-group" style={{ marginTop: '1rem' }}>
                                <label className="modal-label">Applied Date</label>
                                <p style={{ margin: 0 }}>{formatDate(selectedApplication.appliedAt)}</p>
                             </div>

                             <div className="modal-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                <button 
                                    onClick={() => setSelectedApplication(null)}
                                    className="modal-btn-cancel"
                                >
                                    Close
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

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
