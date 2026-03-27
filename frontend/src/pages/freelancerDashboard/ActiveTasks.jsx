import { Briefcase, Clock, CheckCircle, MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import StarRating from '../../components/StarRating';

const ActiveTasks = () => {
    // === State Management ===
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // === Review Client Modal State ===
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null); // { jobId, jobTitle, clientName }
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [reviewedJobs, setReviewedJobs] = useState(new Set()); // Tracks jobIds already reviewed

    // === Fetch Active & Completed Tasks ===
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch all applications
            const response = await axios.get('http://localhost:5000/api/jobs/my-applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const allApplications = response.data;

            // Split into Active (Approved but not completed) and Completed
            const active = allApplications.filter(app => app.status === 'Approved' && app.jobStatus !== 'Completed');
            const completed = allApplications.filter(app => app.jobStatus === 'Completed' && app.status === 'Approved');

            setTasks(active);
            setCompletedTasks(completed);

            // Check which completed jobs already have a freelancer-to-client review
            const checkedReviews = await Promise.all(
                completed.map(app =>
                    axios.get(`http://localhost:5000/api/reviews/check?jobId=${app._id}&reviewType=freelancer-to-client`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(res => res.data.reviewed ? app._id : null)
                    .catch(() => null)
                )
            );

            // Save reviewed job IDs into a Set for fast lookup
            setReviewedJobs(new Set(checkedReviews.filter(Boolean)));

        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    // === Format Helpers ===
    const formatBudget = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric' 
        });
    };

    // === Review Modal Handlers ===
    const openClientReview = (task) => {
        setReviewTarget({ 
            jobId: task._id, 
            jobTitle: task.jobTitle, 
            clientName: task.client 
        });
        setReviewForm({ rating: 0, comment: '' });
        setShowReviewModal(true);
    };

    const handleSubmitClientReview = async () => {
        if (reviewForm.rating === 0) { 
            toast.error('Please pick a star rating'); 
            return; 
        }

        try {
            const token = localStorage.getItem('token');

            // Fetch full job to get the Client's user ID (postedBy)
            const jobRes = await axios.get(`http://localhost:5000/api/jobs/${reviewTarget.jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const clientId = jobRes.data.postedBy?._id || jobRes.data.postedBy;

            // Submit Review
            await axios.post('http://localhost:5000/api/reviews', {
                jobId: reviewTarget.jobId,
                revieweeId: clientId,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                reviewType: 'freelancer-to-client'
            }, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });

            toast.success(`Review submitted for ${reviewTarget.clientName}!`);
            
            // Mark as reviewed in UI
            setReviewedJobs(prev => new Set([...prev, reviewTarget.jobId]));
            setShowReviewModal(false);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading active tasks...</div>;
    }

    return (
        <div>
            {/* === Page Header === */}
            <div className="page-header">
                <h1>Active Tasks</h1>
                <p>Your approved jobs and completed work history.</p>
            </div>

            {/* === Summary Cards === */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Active Tasks</p>
                            <h3>{tasks.length}</h3>
                        </div>
                        <div className="stat-card-icon stat-icon-blue">
                            <Briefcase />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Active Earnings</p>
                            <h3>{formatBudget(tasks.reduce((sum, t) => sum + (t.bidAmount || t.budget || 0), 0))}</h3>
                        </div>
                        <div className="stat-card-icon stat-icon-purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₨</text>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Completed</p>
                            <h3>{completedTasks.length}</h3>
                        </div>
                        <div className="stat-card-icon stat-icon-green">
                            <CheckCircle />
                        </div>
                    </div>
                </div>
            </div>

            {/* === Active Jobs Section === */}
            <h2 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem', color: '#111827' }}>In Progress</h2>
            
            {tasks.length === 0 ? (
                <div className="table-card">
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                        <Briefcase size={44} style={{ margin: '0 auto 1rem' }} />
                        <p>No active tasks. Browse "Find Work" to get started!</p>
                    </div>
                </div>
            ) : (
                <div className="workers-grid">
                    {tasks.map((task) => (
                        <div key={task._id} className="worker-card">
                            {/* Task Header */}
                            <div className="worker-header">
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                        {task.jobTitle}
                                    </h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                        Client: {task.client}
                                    </p>
                                </div>
                                <span className="badge badge-blue">In Progress</span>
                            </div>

                            {/* Task Details */}
                            <div className="worker-stats" style={{ marginTop: '1rem' }}>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">
                                        <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} />
                                        Approved
                                    </span>
                                    <span className="worker-stat-value">{formatDate(task.appliedAt)}</span>
                                </div>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">
                                        <MapPin size={13} style={{ display: 'inline', marginRight: '3px' }} />
                                        Location
                                    </span>
                                    <span className="worker-stat-value">{task.location}</span>
                                </div>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Payment</span>
                                    <span className="worker-stat-value" style={{ color: '#A41F39', fontWeight: '600' }}>
                                        {task.bidAmount ? `${formatBudget(task.bidAmount)} (your bid)` : formatBudget(task.budget)}
                                    </span>
                                </div>
                            </div>

                            {/* Waiting for Client Notice */}
                            <div style={{ 
                                marginTop: '1rem', 
                                padding: '10px 12px', 
                                background: '#eff6ff', 
                                borderRadius: '8px', 
                                fontSize: '13px', 
                                color: '#1d4ed8' 
                            }}>
                                Waiting for the client to mark this job as complete.
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === Completed Work Section === */}
            {completedTasks.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.1rem', margin: '2rem 0 1rem', color: '#111827' }}>Completed Work</h2>
                    <div className="workers-grid">
                        {completedTasks.map((task) => {
                            const alreadyReviewed = reviewedJobs.has(task._id);
                            
                            return (
                                <div key={task._id} className="worker-card">
                                    <div className="worker-header">
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem' }}>{task.jobTitle}</h3>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                                Client: {task.client}
                                            </p>
                                        </div>
                                        <span className="badge badge-green">
                                            <CheckCircle size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                            Done
                                        </span>
                                    </div>
                                    
                                    <div className="worker-stats" style={{ marginTop: '0.75rem' }}>
                                        <div className="worker-stat-row">
                                            <span className="worker-stat-label">Earned</span>
                                            <span className="worker-stat-value" style={{ color: '#059669', fontWeight: '600' }}>
                                                {task.bidAmount ? formatBudget(task.bidAmount) : formatBudget(task.budget)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action: Rate Client OR Reviewed Status */}
                                    {alreadyReviewed ? (
                                        <div style={{ 
                                            marginTop: '0.75rem', 
                                            padding: '8px 12px', 
                                            background: '#F0FDF4', 
                                            borderRadius: '8px', 
                                            fontSize: '13px', 
                                            color: '#059669', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '6px' 
                                        }}>
                                            <Star size={14} fill="#059669" /> Client reviewed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openClientReview(task)}
                                            style={{ 
                                                marginTop: '0.75rem', 
                                                width: '100%', 
                                                padding: '9px', 
                                                borderRadius: '8px', 
                                                border: '1px solid #F59E0B', 
                                                background: '#FFFBEB', 
                                                color: '#B45309', 
                                                cursor: 'pointer', 
                                                fontSize: '13px', 
                                                fontWeight: '500', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                gap: '6px' 
                                            }}
                                        >
                                            <Star size={15} /> Rate this client
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* === Rate Client Modal === */}
            {showReviewModal && reviewTarget && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    background: 'rgba(0,0,0,0.55)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '1rem', 
                        padding: 0, 
                        maxWidth: '420px', 
                        width: '92%', 
                        overflow: 'hidden' 
                    }}>

                        {/* Header */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1D4ED8, #60A5FA)', 
                            padding: '1.5rem 2rem 1rem' 
                        }}>
                            <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                                {reviewTarget.jobTitle}
                            </p>
                            <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>
                                How was working with {reviewTarget.clientName}?
                            </h2>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.5rem 2rem 2rem' }}>
                            <p style={{ margin: '0 0 1.25rem', fontSize: '13px', color: '#6B7280' }}>
                                Your feedback helps other freelancers know what to expect from this client.
                            </p>

                            {/* Stars */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '10px', color: '#374151' }}>
                                    Your rating
                                </label>
                                <StarRating 
                                    value={reviewForm.rating} 
                                    onChange={r => setReviewForm({ ...reviewForm, rating: r })} 
                                    size={40} 
                                />
                                {reviewForm.rating > 0 && (
                                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#F59E0B', fontWeight: '500' }}>
                                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][reviewForm.rating]}
                                    </p>
                                )}
                            </div>

                            {/* Comment Textarea */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '8px', color: '#374151' }}>
                                    Comment <span style={{ color: '#9CA3AF', fontWeight: '400' }}>(optional)</span>
                                </label>
                                <textarea
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="Was the client clear with instructions? Did they pay on time?"
                                    style={{ 
                                        width: '100%', 
                                        minHeight: '80px', 
                                        padding: '10px 12px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #E5E7EB', 
                                        fontSize: '13px', 
                                        resize: 'vertical', 
                                        fontFamily: 'inherit', 
                                        boxSizing: 'border-box' 
                                    }}
                                    maxLength={500}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setShowReviewModal(false)} 
                                    style={{ 
                                        flex: 1, padding: '10px', borderRadius: '8px', 
                                        border: '1px solid #E5E7EB', background: 'white', 
                                        cursor: 'pointer', fontSize: '13px', color: '#6B7280' 
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitClientReview}
                                    disabled={reviewForm.rating === 0}
                                    style={{ 
                                        flex: 2, padding: '10px', borderRadius: '8px', border: 'none', 
                                        background: reviewForm.rating === 0 ? '#E5E7EB' : '#1D4ED8', 
                                        color: reviewForm.rating === 0 ? '#9CA3AF' : 'white', 
                                        cursor: reviewForm.rating === 0 ? 'default' : 'pointer', 
                                        fontSize: '13px', fontWeight: '500' 
                                    }}
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveTasks;