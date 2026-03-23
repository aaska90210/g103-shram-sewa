import { User, Mail, MapPin, Phone, Edit, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const ClientProfile = () => {
    // === Profile State ===
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        verified: false,
        verificationStatus: 'Pending'
    });
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...profile });

    // Fetch user profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const user = response.data;
            const profileData = {
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || '',
                verified: user.isVerified || false,
                verificationStatus: user.verificationStatus || 'Pending'
            };
            
            // Update local storage with fresh data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                name: user.fullName || storedUser.name,
                verificationStatus: user.verificationStatus || storedUser.verificationStatus
            }));
            // Trigger event for other components to update if watching
            window.dispatchEvent(new Event('storage'));

            setProfile(profileData);
            setEditForm(profileData);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // === Handle Edit Mode ===
    const handleEdit = () => {
        setEditForm({ ...profile });
        setIsEditing(true);
    };

    // === Handle Cancel ===
    const handleCancel = () => {
        setEditForm({ ...profile });
        setIsEditing(false);
    };

    // === Handle Input Change ===
    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // === Handle Save ===
    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/auth/profile',
                {
                    fullName: editForm.fullName,
                    phone: editForm.phone,
                    address: editForm.address,
                    bio: editForm.bio
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const updatedUser = response.data;
            const newProfileState = {
                ...profile,
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
                address: updatedUser.address || '',
                bio: updatedUser.bio
            };

            setProfile(newProfileState);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    }

    return (
        <div>
            {/* === Page Header === */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your personal information and contact details.</p>
                </div>
                {!isEditing && (
                    <button onClick={handleEdit} className="btn btn-primary">
                        <Edit size={16} style={{ marginRight: '0.5rem' }} />
                        Edit Profile
                    </button>
                )}
            </div>

            {/* === Profile Overview === */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Account Type</p>
                            <h3><Building size={20} style={{ display: 'inline', color: '#6366F1', marginRight: '8px' }} /> Client</h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Verification Status</p>
                            <h3>
                                <span className={`badge ${profile.verified ? 'badge-green' : 'badge-yellow'}`}>
                                    {profile.verificationStatus}
                                </span>
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Profile Details Form === */}
            <div className="form-card">
                <form onSubmit={handleSave}>
                    {/* Full Name */}
                    <div className="form-group">
                        <label className="form-label">
                            <User size={16} />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={isEditing ? editForm.fullName : profile.fullName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-input"
                        />
                    </div>

                    {/* Email and Phone Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={16} />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={isEditing ? editForm.email : profile.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Phone size={16} />
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={isEditing ? editForm.phone : profile.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Address/Location */}
                    <div className="form-group">
                        <label className="form-label">
                            <MapPin size={16} />
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={isEditing ? editForm.address : profile.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-input"
                            placeholder="e.g. Kathmandu, Nepal"
                        />
                    </div>

                    {/* Bio / Company Description */}
                    <div className="form-group">
                        <label className="form-label">Bio / Company Description</label>
                        <textarea
                            name="bio"
                            value={isEditing ? editForm.bio : profile.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-textarea"
                            placeholder="Tell freelancers about yourself or your company..."
                            rows={4}
                        />
                    </div>

                    {/* Action Buttons (only show when editing) */}
                    {isEditing && (
                        <div className="form-actions">
                            <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ClientProfile;