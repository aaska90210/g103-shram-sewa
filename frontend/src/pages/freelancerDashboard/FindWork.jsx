import { Search, MapPin, Briefcase, Filter, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electrician', 'Plumber', 'Painter', 'Carpenter', 'Mason', 'Cleaner', 'Makeup'];

const FindWork = () => {
    // === State Management ===
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // === New State: Location & Bidding ===
    const [nearMe, setNearMe] = useState(false);
    const [locating, setLocating] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyTarget, setApplyTarget] = useState(null);
    const [applyForm, setApplyForm] = useState({ bidAmount: '', message: '' });

    // === User Verification Check ===
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
            setNearMe(false); // Reset near me status when fetching all jobs
            
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

    // === Location Based Search ===
    // Uses browser geolocation to find jobs within 10km
    const handleNearMe = () => {
        if (!navigator.geolocation) { 
            toast.error('Geolocation not supported by your browser'); 
            return; 
        }
        
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    const res = await axios.get(`http://localhost:5000/api/jobs/nearby?lat=${lat}&lng=${lng}&km=10`);
                    
                    setJobs(res.data);
                    setNearMe(true);
                    toast.success(`Found ${res.data.length} jobs within 10km`);
                } catch (error) { 
                    console.error('Error fetching nearby jobs:', error);
                    toast.error('Failed to fetch nearby jobs'); 
                } finally { 
                    setLocating(false); 
                }
            },
            () => { 
                toast.error('Location access denied. Please allow location in browser settings.'); 
                setLocating(false); 
            }
        );
    };

    // === Filter Jobs ===
    // Filters jobs based on search term and category
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? job.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    // === Apply for Job Modal Handlers ===
    const openApplyModal = (job) => {
        if (!isVerified) { 
            toast.error('Account not verified. You cannot apply yet.'); 
            return; 
        }
        setApplyTarget(job);
        setApplyForm({ bidAmount: '', message: '' });
        setShowApplyModal(true);
    };

    const handleApplySubmit = async () => {
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
                `http://localhost:5000/api/jobs/${applyTarget._id}/apply`,
                { 
                    bidAmount: applyForm.bidAmount || null, 
                    message: applyForm.message 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            toast.success('Application submitted successfully!');
            setShowApplyModal(false);
            
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
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Location Search Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button 
                        onClick={fetchJobs} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '14px' }}
                    >
                        All Jobs
                    </button>
                    <button
                        onClick={handleNearMe}
                        disabled={locating}
                        style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '14px',
                            padding: '8px 16px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            cursor: locating ? 'not-allowed' : 'pointer',
                            background: nearMe ? '#059669' : '#A41F39', 
                            color: 'white', 
                            fontWeight: '500'
                        }}
                    >
                        <Navigation size={16} />
                        {locating ? 'Locating...' : nearMe ? 'Showing Near Me ✓' : 'Jobs Near Me'}
                    </button>
                    {nearMe && (
                        <span style={{ fontSize: '13px', color: '#6B7280', alignSelf: 'center' }}>
                            Within 10km of your location
                        </span>
                    )}
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
                        <p>{nearMe ? 'No jobs found near your location.' : 'No jobs found matching your criteria.'}</p>
                        {nearMe && (
                            <button onClick={fetchJobs} className="btn btn-secondary" style={{ marginTop: '12px' }}>
                                Show All Jobs
                            </button>
                        )}
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
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className="badge badge-green">
                                        {job.status}
                                    </span>
                                    {job.coordinates?.coordinates && (
                                        <span style={{ fontSize: '11px', color: '#059669', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Navigation size={10} /> Pinned
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Job Details */}
                            <div style={{ margin: '1rem 0' }}>
                                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>
                                    {job.description.length > 120 ? job.description.substring(0, 120) + '...' : job.description}
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
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Posted by</span>
                                    <span className="worker-stat-value">{job.postedBy?.fullName || 'Client'}</span>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <button
                                onClick={() => openApplyModal(job)}
                                className="worker-action"
                                disabled={!isVerified}
                                style={{ 
                                    marginTop: '1rem', 
                                    opacity: isVerified ? 1 : 0.6, 
                                    cursor: isVerified ? 'pointer' : 'not-allowed' 
                                }}
                            >
                                {isVerified ? 'Apply Now' : 'Verification Pending'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* === Apply Modal === */}
            {showApplyModal && applyTarget && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '1rem', 
                        padding: '2rem', 
                        maxWidth: '440px', 
                        width: '90%' 
                    }}>
                        <h2 style={{ margin: '0 0 6px' }}>Apply for Job</h2>
                        <p style={{ margin: '0 0 1.5rem', color: '#6B7280', fontSize: '14px' }}>
                            {applyTarget.title} · {formatBudget(applyTarget.budget)}
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                                Your Bid (NPR) <span style={{ color: '#9ca3af', fontWeight: '400' }}>optional</span>
                            </label>
                            <input
                                type="number"
                                placeholder={`Leave blank to accept Rs. ${Number(applyTarget.budget).toLocaleString('en-IN')}`}
                                value={applyForm.bidAmount}
                                onChange={e => setApplyForm({ ...applyForm, bidAmount: e.target.value })}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e5e7eb', 
                                    fontSize: '14px', 
                                    boxSizing: 'border-box' 
                                }}
                                min="0"
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                                Message to Client <span style={{ color: '#9ca3af', fontWeight: '400' }}>optional</span>
                            </label>
                            <textarea
                                placeholder="Briefly describe your experience or why you're a good fit..."
                                value={applyForm.message}
                                onChange={e => setApplyForm({ ...applyForm, message: e.target.value })}
                                style={{ 
                                    width: '100%', 
                                    minHeight: '80px', 
                                    padding: '10px 12px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e5e7eb', 
                                    fontSize: '14px', 
                                    resize: 'vertical', 
                                    fontFamily: 'inherit', 
                                    boxSizing: 'border-box' 
                                }}
                                maxLength={300}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setShowApplyModal(false)} 
                                className="btn btn-secondary" 
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleApplySubmit} 
                                className="btn btn-primary" 
                                style={{ flex: 1 }}
                            >
                                Submit Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindWork;