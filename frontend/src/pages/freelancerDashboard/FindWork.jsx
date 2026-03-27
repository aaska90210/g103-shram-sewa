import { Search, MapPin, Briefcase, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


const handleApply = async (jobId) => {
  const loading = toast.loading("Applying...");

  try {

    toast.dismiss(loading);
    toast.success("Application submitted ");

  } catch (error) {
    toast.dismiss(loading);
    toast.error("Failed to apply ");
  }
};
const FindWork = () => {
    // === State Management ===
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Get user info for verification check
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isVerified = user.verificationStatus === 'Verified';

    // === Fetch Available Jobs ===
    // Gets all active jobs posted by clients
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            
            // Fetch all active jobs from backend
            const response = await axios.get('http://localhost:5000/api/jobs?status=Active');
            setJobs(response.data);
            
        } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    // === Filter Jobs ===
    // Filters jobs based on search term and category
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? job.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    // === Apply for Job ===
    // Worker can apply/bid for a job
    const handleApply = async (jobId) => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token) {
                toast.error('Please login to apply for jobs');
                return;
            }

            if (user.verificationStatus !== 'Verified') {
                toast.error('Account not verified. You cannot apply for jobs yet.');
                return;
            }

            // Perform the API call to apply
            await axios.post(
                `http://localhost:5000/api/jobs/${jobId}/apply`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success('Application submitted successfully!');
            
        } catch (error) {
            console.error('Error applying for job:', error);
            const message = error.response?.data?.message || 'Failed to submit application';
            toast.error(message);
        }
    };

    // === Format Budget ===
    const formatBudget = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    return (
        <div>
            {/* === Page Header === */}
            <div className="page-header">
                <h1>Find Work</h1>
                <p>Browse available jobs and apply to opportunities that match your skills.</p>
            </div>

            {/* === Search and Filter Bar === */}
            <div className="form-card" style={{ marginBottom: '1.5rem' }}>
                <div className="form-row">
                    {/* Search Input */}
                    <div className="form-group">
                        <label className="form-label">
                            <Search size={16} />
                            Search Jobs
                        </label>
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="form-group">
                        <label className="form-label">
                            <Filter size={16} />
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="form-select"
                        >
                            <option value="">All Categories</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Painter">Painter</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="Mason">Mason</option>
                            <option value="Cleaner">Home Cleaner</option>
                            <option value="Makeup">MUA</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* === Jobs List === */}
            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading available jobs...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="table-card">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>No jobs found matching your criteria.</p>
                    </div>
                </div>
            ) : (
                <div className="workers-grid">
                    {filteredJobs.map((job) => (
                        <div key={job._id} className="worker-card">
                            {/* Job Header */}
                            <div className="worker-header">
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#111827' }}>
                                        {job.title}
                                    </h3>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                        <Briefcase size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        {job.category}
                                    </p>
                                </div>
                                <span className="badge badge-green" style={{ alignSelf: 'flex-start' }}>
                                    {job.status}
                                </span>
                            </div>

                            {/* Job Details */}
                            <div style={{ margin: '1rem 0' }}>
                                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
                                    {job.description.substring(0, 120)}...
                                </p>
                            </div>

                            {/* Job Stats */}
                            <div className="worker-stats">
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">
                                        <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        Location
                                    </span>
                                    <span className="worker-stat-value">{job.location}</span>
                                </div>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Budget</span>
                                    <span className="worker-stat-value" style={{ color: '#A41F39', fontWeight: '600' }}>
                                        {formatBudget(job.budget)}
                                    </span>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <button
                                onClick={() => handleApply(job._id)}
                                className="worker-action"
                                style={{ 
                                    marginTop: '1rem',
                                    opacity: isVerified ? 1 : 0.6,
                                    cursor: isVerified ? 'pointer' : 'not-allowed',
                                    backgroundColor: isVerified ? '' : '#ccc'
                                }}
                                disabled={!isVerified}
                                title={!isVerified ? 'You must be verified to apply' : ''}
                            >
                                {isVerified ? 'Apply Now' : 'Verification Pending'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FindWork;
