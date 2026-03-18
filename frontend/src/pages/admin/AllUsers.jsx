import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Edit2, Lock, XCircle } from 'lucide-react';

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
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users", error);
            toast.error("Failed to load users");
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
        <div className="dashboard-container relative">
            {/* Modal for Password Change */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-96 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
                            <button 
                                onClick={() => setEditingUser(null)} 
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Update password for <span className="font-semibold text-gray-800">{editingUser.fullName}</span>
                        </p>
                        
                        <form onSubmit={submitPasswordChange}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                    <Lock size={18} className="text-gray-400 mr-3" />
                                    <input 
                                        type="password" 
                                        className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-500/20"
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
                                        <div className="flex items-center gap-3">
                                            <button 
                                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                                onClick={() => handleEditPassClick(user)}
                                                title="Change Password"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                                                onClick={() => deleteUser(user._id)}
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
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