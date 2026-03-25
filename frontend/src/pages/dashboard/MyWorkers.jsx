import { Users, Star, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyWorkers = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login first');
                    setLoading(false);
                    return;
                }

                // 1) Fetch hirer jobs
                const jobsRes = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const jobs = jobsRes.data || [];
                // Filter jobs that have approved applicants
                const jobIdsWithApproved = jobs
                    .filter((job) => Array.isArray(job.applicants) && job.applicants.some((a) => a.status === 'Approved'))
                    .map((job) => job._id);

                if (jobIdsWithApproved.length === 0) {
                    setWorkers([]);
                    setLoading(false);
                    return;
                }

                // 2) Fetch detailed job info to get populated applicant data
                const detailPromises = jobIdsWithApproved.map((id) =>
                    axios.get(`http://localhost:5000/api/jobs/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then((res) => res.data)
                );

                const detailedJobs = await Promise.all(detailPromises);

                // 3) Collect unique approved applicants across jobs
                const workerMap = new Map();
                detailedJobs.forEach((job) => {
                    (job.applicants || []).forEach((app) => {
                        if (app.status === 'Approved') {
                            if (!workerMap.has(app._id)) {
                                workerMap.set(app._id, {
                                    id: app._id,
                                    name: app.name || 'Worker',
                                    skill: app.category || 'N/A',
                                    rating: app.rating || '—',
                                    completedJobs: app.completedJobs || 0,
                                    phone: app.phone || 'N/A',
                                    jobTitle: job.title,
                                    jobStatus: job.status
                                });
                            }
                        }
                    });
                });

                setWorkers(Array.from(workerMap.values()));
            } catch (error) {
                console.error('Error loading workers:', error);
                toast.error(error.response?.data?.message || 'Failed to load workers');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkers();
    }, []);

    if (loading) {
        return (
            <div className="table-card" style={{ padding: '2rem', textAlign: 'center' }}>
                Loading your workers...
            </div>
        );
    }

    return (
        <div>
            {/* page header */}
            <div className="page-header">
                <h1>My Workers</h1>
                <p>Workers you've hired previously.</p>
            </div>

            {/* workers grid */}
            <div className="workers-grid">
                {workers.length === 0 ? (
                    <div className="table-card" style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                        <Users size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
                        <p style={{ color: '#6B7280' }}>No approved workers yet. Approve an applicant to see them here.</p>
                    </div>
                ) : (
                    workers.map((worker) => (
                        <div key={worker.id} className="worker-card">
                            {/* worker avatar */}
                            <div className="worker-header">
                                <div className="worker-avatar">
                                    {worker.name?.charAt(0) || 'W'}
                                </div>
                                <div className="worker-info">
                                    <h3>{worker.name}</h3>
                                    <p>{worker.skill}</p>
                                    <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>{worker.jobTitle}</p>
                                </div>
                            </div>

                            {/* worker stats */}
                            <div className="worker-stats">
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Rating</span>
                                    <div className="worker-stat-value">
                                        <Star className="star-icon" />
                                        <span>{worker.rating}</span>
                                    </div>
                                </div>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Completed Jobs</span>
                                    <div className="worker-stat-value">
                                        <Briefcase className="briefcase-icon" />
                                        <span>{worker.completedJobs}</span>
                                    </div>
                                </div>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Phone</span>
                                    <span className="worker-stat-value">{worker.phone}</span>
                                </div>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Job Status</span>
                                    <span className="worker-stat-value">{worker.jobStatus}</span>
                                </div>
                            </div>

                            {/* action button */}
                            <button className="worker-action">
                                Hire Again
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyWorkers;
