import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyFreelancers = () => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFreelancers();
    }, []);

    const fetchFreelancers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/users?role=Freelancer&verificationStatus=Pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFreelancers(res.data);
        } catch (error) {
            console.error("Error fetching freelancers", error);
            toast.error("Failed to load freelancers");
        } finally {
            setLoading(false);
        }
    };

    const verifyUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/verify/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Freelancer verified successfully");
            fetchFreelancers(); // Refresh list
        } catch (error) {
            toast.error("Failed to verify freelancer");
        }
    };

    const rejectUser = async (id) => {
        if (!window.confirm("Are you sure you want to reject this freelancer?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/reject/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Freelancer rejected successfully");
            fetchFreelancers(); // Refresh list
        } catch (error) {
            toast.error("Failed to reject freelancer");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <h1>Verify Freelancers</h1>
                <p>Approve or Reject pending freelancer accounts</p>
            </div>

            <div className="table-card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freelancers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No pending verifications</td>
                                </tr>
                            ) : (
                                freelancers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">Pending</span>
                                        </td>
                                        <td className="flex gap-2">
                                            <button 
                                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                                onClick={() => verifyUser(user._id)}
                                                title="Approve"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button 
                                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded flex items-center gap-1 transition-colors"
                                                onClick={() => rejectUser(user._id)}
                                                title="Reject"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VerifyFreelancers;