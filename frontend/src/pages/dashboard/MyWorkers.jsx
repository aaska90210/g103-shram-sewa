import { Users, Star, Briefcase } from 'lucide-react';

// static worker data
const workers = [
    { id: 1, name: 'Ramesh Kumar', skill: 'Plumber', rating: 4.8, completedJobs: 12, phone: '+91 98765 43210' },
    { id: 2, name: 'Suresh Patil', skill: 'Electrician', rating: 4.9, completedJobs: 18, phone: '+91 98765 43211' },
    { id: 3, name: 'Anita Sharma', skill: 'Cleaner', rating: 4.7, completedJobs: 8, phone: '+91 98765 43212' },
    { id: 4, name: 'Manoj Verma', skill: 'Painter', rating: 4.6, completedJobs: 10, phone: '+91 98765 43213' },
];

const MyWorkers = () => {
    return (
        <div>
            {/* page header */}
            <div className="page-header">
                <h1>My Workers</h1>
                <p>Workers you've hired previously.</p>
            </div>

            {/* workers grid */}
            <div className="workers-grid">
                {workers.map((worker) => (
                    <div key={worker.id} className="worker-card">
                        {/* worker avatar */}
                        <div className="worker-header">
                            <div className="worker-avatar">
                                {worker.name.charAt(0)}
                            </div>
                            <div className="worker-info">
                                <h3>{worker.name}</h3>
                                <p>{worker.skill}</p>
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
                        </div>

                        {/* action button */}
                        <button className="worker-action">
                            Hire Again
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyWorkers;
