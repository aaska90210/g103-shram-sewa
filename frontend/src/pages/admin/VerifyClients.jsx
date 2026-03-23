import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdCheckCircle, MdCancel } from 'react-icons/md';

const VerifyClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch users with verificationStatus=Pending
            const res = await axios.get('http://localhost:5000/api/admin/users?role=Client&verificationStatus=Pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (error) {
            console.error("Error fetching clients", error);
            toast.error("Failed to load clients");
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
            toast.success("Client verified successfully");
            fetchClients(); // Refresh list
        } catch (error) {
            toast.error("Failed to verify client");
        }
    };

    const rejectUser = async (id) => {
        if (!window.confirm("Are you sure you want to reject this client?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/reject/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Client rejected successfully");
            fetchClients(); // Refresh list
        } catch (error) {
            toast.error("Failed to reject client");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <h1>Verify Clients</h1>
                <p>Approve or Reject pending client accounts</p>
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
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No pending verifications</td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client._id}>
                                        <td>{client.fullName}</td>
                                        <td>{client.email}</td>
                                        <td>{client.role}</td>
                                        <td>
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">Pending</span>
                                        </td>
                                        <td className="flex gap-2">
                                            <button 
                                                className="approve-action-btn"
                                                onClick={() => verifyUser(client._id)}
                                                title="Approve"
                                            >
                                                <MdCheckCircle style={{fontSize: '18px'}} /> Approve
                                            </button>
                                            <button 
                                                className="reject-action-btn"
                                                onClick={() => rejectUser(client._id)}
                                                title="Reject"
                                            >
                                                <MdCancel style={{fontSize: '18px'}} /> Reject
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

export default VerifyClients;