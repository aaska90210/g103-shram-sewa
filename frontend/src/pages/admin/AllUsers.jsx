import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdLock, MdClose } from 'react-icons/md';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null); // For edit modal
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("No authentication token found");
                setLoading(false);
                return;
            }

            console.log("Fetching users...");
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Users fetched:", res.data);
            setUsers(res.data);
            
            if (res.data.length === 0) {
                toast("No users found in the database.", { icon: 'ℹ️' });
            }
        } catch (error) {
            console.error("Error fetching users", error);
            const msg = error.response?.data?.message || "Failed to load users";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleEditPassClick = (user) => {
        setEditingUser(user);
        setNewPassword('');
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}/password`, 
                { password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Password updated successfully");
            setEditingUser(null);
        } catch (error) {
            toast.error("Failed to update password");
        }
    };

    // Helper to get status badge classes based on verificationStatus(or isVerified fallback)
    const getStatusBadge = (user) => {
        if (user.verificationStatus === 'Verified') {
            return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">Verified</span>;
        } else if (user.verificationStatus === 'Rejected') {
            return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-semibold">Rejected</span>;
        } else {
             // Fallback or Pending
            return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-semibold">Unverified</span>;
        }
    };

    return (
        <div className="dashboard-container">
            {/* Modal for Password Change */}
            {editingUser && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Change Password</h3>
                            <button 
                                onClick={() => setEditingUser(null)} 
                                className="modal-close"
                            >
                                <MdClose size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Update password for <span className="font-semibold text-gray-800">{editingUser.fullName}</span>
                        </p>
                        
                        <form onSubmit={submitPasswordChange}>
                            <div className="modal-form-group">
                                <label className="modal-label">New Password</label>
                                <div className="modal-input-wrapper">
                                    <MdLock className="modal-input-icon" size={18} />
                                    <input 
                                        type="password" 
                                        className="modal-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min. 6 chars)"
                                        autoFocus
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingUser(null)}
                                    className="modal-btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="modal-btn-confirm"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="page-header">
                <h1>All Users</h1>
                <p>Manage all registered users</p>
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
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td className="align-middle">
                                        {getStatusBadge(user)}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="edit-action-btn"
                                                onClick={() => handleEditPassClick(user)}
                                                title="Change Password"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            <button 
                                                className="delete-action-btn"
                                                onClick={() => deleteUser(user._id)}
                                                title="Delete User"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllUsers;