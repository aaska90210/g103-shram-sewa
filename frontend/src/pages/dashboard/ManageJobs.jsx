import { Eye, Edit, Trash2, Filter, User, Check, X, ShieldCheck, Phone, MapPin, Briefcase, DollarSign, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


// Accept booking
const handleAccept = async (id) => {
  const loading = toast.loading("Accepting...");

  try {

    toast.dismiss(loading);
    toast.success("Booking accepted ");

  } catch (error) {
    toast.dismiss(loading);
    toast.error("Failed to accept ");
  }
};

// Reject booking
const handleReject = async (id) => {
  const loading = toast.loading("Rejecting...");

  try {

    toast.dismiss(loading);
    toast.error("Booking rejected ");

  } catch (error) {
    toast.dismiss(loading);
    toast.error("Failed to reject ");
  }
};

const ManageJobs = () => {
    // State for jobs data
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
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

            toast.success('Job updated successfully');
            setShowEditModal(false);
            fetchJobs(); // Refresh the list
        } catch (err) {
            console.error('Error updating job:', err);
            toast.error(err.response?.data?.message || 'Failed to update job');
        }
    };

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
    };

    // View applicant profile
    const handleViewProfile = (applicant) => {
        setSelectedApplicant(applicant);
    };

    // Close profile modal
    const closeProfileModal = () => {
        setSelectedApplicant(null);
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
                                                    onClick={() => handleViewProfile(applicant)}
                                                    className="btn btn-secondary"
                                                    style={{ 
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <User size={16} />
                                                </button>
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

            {/* Applicant Profile Modal - Cute Design */}
            {selectedApplicant && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1100
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1.5rem',
                        padding: '0',
                        maxWidth: '480px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        {/* Decorative Header */}
                        <div style={{ 
                            height: '100px', 
                            background: 'linear-gradient(135deg, #A41F39 0%, #FF8FA3 100%)',
                            borderRadius: '1.5rem 1.5rem 0 0'
                        }}></div>

                        <button 
                            onClick={closeProfileModal}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(255,255,255,0.3)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: 'white',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            ×
                        </button>

                        <div style={{ padding: '0 2rem 2rem', marginTop: '-50px', position: 'relative' }}>
                            {/* Avatar */}
                            <div style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '50%', 
                                backgroundColor: 'white', 
                                padding: '4px',
                                margin: '0 auto 1rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    backgroundColor: '#F3F4F6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <User size={48} color="#9CA3AF" />
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedApplicant.name}</h2>
                                <p style={{ margin: '0.25rem 0 0.75rem', color: '#6B7280' }}>{selectedApplicant.email}</p>
                                
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {selectedApplicant.category && (
                                        <span className="badge badge-blue">
                                            {selectedApplicant.category}
                                        </span>
                                    )}
                                    {selectedApplicant.verificationStatus === 'Verified' ? (
                                        <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldCheck size={14} /> Verified Profile
                                        </span>
                                    ) : (
                                        <span className="badge badge-yellow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Not Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '1rem', 
                                marginBottom: '1.5rem' 
                            }}>
                                <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ backgroundColor: '#DBEAFE', padding: '8px', borderRadius: '50%', color: '#2563EB' }}>
                                        <Phone size={18} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>Phone</p>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {selectedApplicant.phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ backgroundColor: '#DCFCE7', padding: '8px', borderRadius: '50%', color: '#16A34A' }}>
                                        <DollarSign size={18} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>Hourly Rate</p>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                                            {selectedApplicant.hourlyRate ? `Rs. ${selectedApplicant.hourlyRate}` : 'Negotiable'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ backgroundColor: '#FEE2E2', padding: '8px', borderRadius: '50%', color: '#DC2626' }}>
                                        <MapPin size={18} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>Location</p>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {selectedApplicant.address || 'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ backgroundColor: '#FEF3C7', padding: '8px', borderRadius: '50%', color: '#D97706' }}>
                                        <Star size={18} />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>Rating</p>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1F2937' }}>
                                            {selectedApplicant.rating ? `${selectedApplicant.rating} / 5` : 'New'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div style={{ 
                                backgroundColor: '#FFF5F7', 
                                padding: '1.25rem', 
                                borderRadius: '1rem', 
                                marginBottom: '1.5rem',
                                border: '1px dashed #FDA4AF'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#BE123C', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Briefcase size={14} /> About {selectedApplicant.name.split(' ')[0]}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4B5563', lineHeight: '1.6', fontStyle: selectedApplicant.bio ? 'normal' : 'italic' }}>
                                    {selectedApplicant.bio || "No bio information provided by this freelancer yet."}
                                </p>
                            </div>

                            {/* Applied Date */}
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
                                Applied on {new Date(selectedApplicant.appliedAt).toLocaleDateString()}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => {
                                        handleApprove(selectedApplicant._id);
                                        closeProfileModal();
                                    }}
                                    className="btn"
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: '#059669', 
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem',
                                        borderRadius: '0.75rem',
                                        fontWeight: '600',
                                        opacity: selectedApplicant.status === 'Approved' ? 0.7 : 1,
                                        cursor: selectedApplicant.status === 'Approved' ? 'default' : 'pointer'
                                    }}
                                    disabled={selectedApplicant.status === 'Approved'}
                                >
                                    {selectedApplicant.status === 'Approved' ? 'Approved' : 'Approve'}
                                </button>
                                <button
                                    onClick={() => {
                                        handleReject(selectedApplicant._id);
                                        closeProfileModal();
                                    }}
                                    className="btn"
                                    style={{ 
                                        flex: 1, 
                                        backgroundColor: '#EF4444', 
                                        color: 'white', 
                                        border: 'none',
                                        padding: '0.75rem',
                                        borderRadius: '0.75rem',
                                        fontWeight: '600',
                                        opacity: selectedApplicant.status === 'Rejected' ? 0.7 : 1,
                                        cursor: selectedApplicant.status === 'Rejected' ? 'default' : 'pointer'
                                    }}
                                    disabled={selectedApplicant.status === 'Rejected'}
                                >
                                    {selectedApplicant.status === 'Rejected' ? 'Rejected' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageJobs;
