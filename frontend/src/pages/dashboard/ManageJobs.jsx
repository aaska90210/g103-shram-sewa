import { Eye, Edit, Trash2, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManageJobs = () => {
    // State for jobs data
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        category: '',
        description: '',
        budget: '',
        location: '',
        status: ''
    });

    // Fetch jobs from backend on component mount
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login first');
                setLoading(false);
                return;
            }

            // Fetch user's jobs from backend
            const response = await axios.get(
                'http://localhost:5000/api/jobs/my-jobs',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setJobs(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            const message = err.response?.data?.message || 'Failed to fetch jobs';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Format budget as Rs. X,XXX
    const formatBudget = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    // View job applicants
    const handleView = async (job) => {
        try {
            const token = localStorage.getItem('token');

            // Fetch job with populated applicants
            const response = await axios.get(
                `http://localhost:5000/api/jobs/${job._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSelectedJob(response.data);
            setShowApplicantsModal(true);
        } catch (err) {
            console.error('Error fetching job applicants:', err);
            toast.error('Failed to load applicants');
        }
    };

    // Open edit modal
    const handleEdit = (job) => {
        setSelectedJob(job);
        setEditForm({
            title: job.title,
            category: job.category,
            description: job.description,
            budget: job.budget,
            location: job.location,
            status: job.status
        });
        setShowEditModal(true);
    };

    // Handle edit form change
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // Submit edit form
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:5000/api/jobs/${selectedJob._id}`,
                editForm,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

      

    // Approve applicant
    const handleApprove = async (applicantId) => {
        try {
            const token = localStorage.getItem('token');

            await axios.post(
                `http://localhost:5000/api/jobs/${selectedJob._id}/approve/${applicantId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success('Applicant approved successfully');
            // Refresh the applicants list
            handleView(selectedJob);
        } catch (err) {
            console.error('Error approving applicant:', err);
            toast.error(err.response?.data?.message || 'Failed to approve applicant');
        }
    };

    // Reject applicant
    const handleReject = async (applicantId) => {
        try {
            const token = localStorage.getItem('token');

            await axios.post(
                `http://localhost:5000/api/jobs/${selectedJob._id}/reject/${applicantId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success('Applicant rejected');
            // Refresh the applicants list
            handleView(selectedJob);
        } catch (err) {
            console.error('Error rejecting applicant:', err);
            toast.error(err.response?.data?.message || 'Failed to reject applicant');
        }
    };      toast.success('Job updated successfully');
            setShowEditModal(false);
            fetchJobs(); // Refresh the list
        } catch (err) {
            console.error('Error updating job:', err);
            toast.error(err.response?.data?.message || 'Failed to update job');
        }
    };

    // Delete job handler
    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            await axios.delete(
                `http://localhost:5000/api/jobs/${jobId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success('Job deleted successfully');
            fetchJobs(); // Refresh the list
        } catch (err) {
            console.error('Error deleting job:', err);
            toast.error(err.response?.data?.message || 'Failed to delete job');
        }
    };

    return (
        <div>
            {/* page header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>Manage Jobs</h1>
                    <p>View and manage all your posted jobs.</p>
                </div>
                <button className="btn-filter" onClick={fetchJobs}>
                    <Filter />
                    Refresh
                </button>
            </div>

            {/* jobs table */}
            <div className="table-card">
                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <p>Loading jobs...</p>
                        </div>
                    ) : error ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
                            <p>{error}</p>
                            <button onClick={fetchJobs} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                Try Again
                            </button>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <p>No jobs posted yet. Start by posting your first job!</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Budget</th>
                                    <th>Status</th>
                                    <th>Applicants</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job._id}>
                                        <td className="table-cell-bold">{job.title}</td>
                                        <td>{job.category}</td>
                                        <td>{job.location}</td>
                                        <td className="table-cell-bold">{formatBudget(job.budget)}</td>
                                        <td>
                                            <span className={`badge ${
                                                job.status === 'Active' 
                                                    ? 'badge-green' 
                                                    : job.status === 'Completed'
                                                    ? 'badge-blue'
                                                    : 'badge-yellow'
                                            }`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="table-cell-bold">{job.applicants?.length || 0}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="action-btn action-btn-red"
                                                    title="View Applicants"
                                                    onClick={() => handleView(job)}
                                                >
                                                    <Eye />
                                                </button>
                                                <button 
                                                    className="action-btn action-btn-pink"
                                                    title="Edit Job"
                                                    onClick={() => handleEdit(job)}
                                                >
                                                    <Edit />
                                                </button>
                                                <button 
                                                    className="action-btn action-btn-gray"
                                                    title="Delete Job"
                                                    onClick={() => handleDelete(job._id)}
                                                >
                                                    <Trash2 />
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

            {/* Applicants Modal */}
            {showApplicantsModal && selectedJob && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        maxWidth: '700px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#111827' }}>{selectedJob.title}</h2>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                    {selectedJob.applicants?.length || 0} Applicant(s)
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowApplicantsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Job Info */}
                        <div style={{ 
                            padding: '1rem', 
                            backgroundColor: '#F9FAFB', 
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                <div>
                                    <span style={{ color: '#6B7280' }}>Category: </span>
                                    <span style={{ fontWeight: '600', color: '#111827' }}>{selectedJob.category}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#6B7280' }}>Budget: </span>
                                    <span style={{ fontWeight: '600', color: '#A41F39' }}>{formatBudget(selectedJob.budget)}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#6B7280' }}>Location: </span>
                                    <span style={{ fontWeight: '600', color: '#111827' }}>{selectedJob.location}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#6B7280' }}>Status: </span>
                                    <span className={`badge ${
                                        selectedJob.status === 'Active' ? 'badge-green' : 
                                        selectedJob.status === 'Completed' ? 'badge-blue' : 'badge-yellow'
                                    }`}>
                                        {selectedJob.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Applicants List */}
                        <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#111827' }}>Applicants</h3>
                            {!selectedJob.applicants || selectedJob.applicants.length === 0 ? (
                                <div style={{ 
                                    padding: '2rem', 
                                    textAlign: 'center', 
                                    color: '#9CA3AF',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '0.5rem'
                                }}>
                                    <FileText size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                                    <p style={{ margin: 0 }}>No applicants yet</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedJob.applicants.map((applicant) => (
                                        <div 
                                            key={applicant._id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '0.5rem',
                                                backgroundColor: '#FFFFFF'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>
                                                    {applicant.name || 'Worker'}
                                                </p>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                                    {applicant.email || 'No email'}
                                                </p>
                                                {applicant.status && (
                                                    <span 
                                                        className={`badge ${
                                                            applicant.status === 'Approved' ? 'badge-green' :
                                                            applicant.status === 'Rejected' ? 'badge-red' : 'badge-yellow'
                                                        }`}
                                                        style={{ marginTop: '0.5rem', display: 'inline-block' }}
                                                    >
                                                        {applicant.status}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleApprove(applicant._id)}
                                                    className="btn btn-primary"
                                                    style={{ 
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: '#059669',
                                                        borderColor: '#059669'
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(applicant._id)}
                                                    className="btn btn-secondary"
                                                    style={{ 
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                            <button 
                                onClick={() => setShowApplicantsModal(false)}
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Edit Job</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Job Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleEditChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        name="category"
                                        value={editForm.category}
                                        onChange={handleEditChange}
                                        className="form-select"
                                        required
                                    >
                                        <option value="Electrician">Electrician</option>
                                        <option value="Plumber">Plumber</option>
                                        <option value="Painter">Painter</option>
                                        <option value="Carpenter">Carpenter</option>
                                        <option value="Mason">Mason</option>
                                        <option value="Cleaner">Home Cleaner</option>
                                        <option value="Makeup">MUA</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Budget (NPR)</label>
                                    <input
                                        type="number"
                                        name="budget"
                                        value={editForm.budget}
                                        onChange={handleEditChange}
                                        className="form-input"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={editForm.location}
                                    onChange={handleEditChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    value={editForm.status}
                                    onChange={handleEditChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                    className="form-textarea"
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setShowEditModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageJobs;
