import { Briefcase, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Start Task
const startTask = () => {
  toast("Task started ");
};

// Complete Task
const completeTask = () => {
  toast.success("Task completed ");
};

// Cancel Task
const cancelTask = () => {
  toast.error("Task cancelled ");
};

const ActiveTasks = () => {
    // === Active Tasks Data ===
    // Jobs that the worker is currently working on
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // === Fetch Active Tasks ===
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get('http://localhost:5000/api/jobs/my-applications', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Filter only Approved applications which represent active tasks
                // You might also want to check if jobStatus is 'Active'
                const activeTasks = response.data.filter(
                    app => app.status === 'Approved' && app.jobStatus !== 'Completed'
                );

                setTasks(activeTasks);
            } catch (error) {
                console.error('Error fetching active tasks:', error);
                toast.error('Failed to load active tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // === Format Date ===
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // === Format Budget ===
    const formatBudget = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    // === Mark Task as Complete ===
    const handleComplete = (taskId) => {
        // TODO: Implement API call to mark task as complete
        const confirmed = window.confirm('Are you sure you want to mark this task as complete?');
        if (confirmed) {
            alert('Task marked as complete! (API integration pending)');
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
                <p>Manage your current ongoing jobs and track progress.</p>
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
                            <p>Total Earnings (Active)</p>
                            <h3>{formatBudget(tasks.reduce((sum, t) => sum + (t.budget || 0), 0))}</h3>
                        </div>
                        <div className="stat-card-icon stat-icon-purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₨</text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Active Tasks List === */}
            {tasks.length === 0 ? (
                <div className="table-card">
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <Briefcase size={48} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
                        <p>No active tasks at the moment. Browse "Find Work" to start earning!</p>
                    </div>
                </div>
            ) : (
                <div className="workers-grid">
                    {tasks.map((task) => (
                        <div key={task._id} className="worker-card">
                            {/* Task Header */}
                            <div className="worker-header">
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#111827' }}>
                                        {task.jobTitle}
                                    </h3>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
                                        Client: {task.client}
                                    </p>
                                </div>
                                <span className="badge badge-blue">
                                    {task.status === 'Approved' ? 'In Progress' : task.status}
                                </span>
                            </div>

                            {/* Task Details */}
                            <div className="worker-stats" style={{ marginTop: '1rem' }}>
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">
                                        <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        Started
                                    </span>
                                    <span className="worker-stat-value">{formatDate(task.appliedAt)}</span>
                                </div>
                                {/* Deadline removed as it's not in backend yet */}
                                <div className="worker-stat-row">
                                    <span className="worker-stat-label">Payment</span>
                                    <span className="worker-stat-value" style={{ color: '#A41F39', fontWeight: '600' }}>
                                        {formatBudget(task.budget)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar - Removed as backend doesn't support it yet */}
                            
                            {/* Complete Button */}
                            <button
                                onClick={() => handleComplete(task._id)}
                                className="worker-action"
                                style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <CheckCircle size={18} />
                                Mark as Complete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveTasks;
