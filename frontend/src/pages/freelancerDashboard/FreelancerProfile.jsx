import { User, Star, Briefcase, MapPin, Phone, Mail, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CATEGORIES = [
    "Electrician",
    "Plumber",
    "Painter",
    "Carpenter",
    "Mason",
    "Home Cleaner",
    "MUA"
];

const FreelancerProfile = () => {
    // === Profile State ===
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        category: '',
        bio: '',
        hourlyRate: 0,
        rating: 0,
        completedJobs: 0,
        verified: false,
        verificationStatus: 'Pending'
    });
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...profile });
    const [isCustomCategory, setIsCustomCategory] = useState(false);

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
                category: user.category || 'Electrician', 
                bio: user.bio || '',
                hourlyRate: user.hourlyRate || 0,
                rating: user.rating || 0,
                completedJobs: user.completedJobs || 0,
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
            window.dispatchEvent(new Event('storage'));

            setProfile(profileData);
            setEditForm(profileData);
            
            // Check if user has a custom category
            if (profileData.category && !CATEGORIES.includes(profileData.category)) {
                setIsCustomCategory(true);
            } else {
                setIsCustomCategory(false);
            }
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
        // Check if category is custom in profile state
        if (profile.category && !CATEGORIES.includes(profile.category)) {
            setIsCustomCategory(true);
        } else {
            setIsCustomCategory(false);
        }
        setIsEditing(true);
    };

    // === Handle Cancel ===
    const handleCancel = () => {
        setEditForm({ ...profile });
        
        // Reset custom category flag based on original profile
        if (profile.category && !CATEGORIES.includes(profile.category)) {
            setIsCustomCategory(true);
        } else {
            setIsCustomCategory(false);
        }
        setIsEditing(false);
    };

    // === Handle Category Select Change ===
    const handleCategorySelect = (e) => {
        const value = e.target.value;
        if (value === 'Other') {
            setIsCustomCategory(true);
            setEditForm({ ...editForm, category: '' });
        } else {
            setIsCustomCategory(false);
            setEditForm({ ...editForm, category: value });
        }
    };

    // === Handle Input Change ===
    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    // === Handle Save ===
    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const saveCategory = isCustomCategory ? editForm.category : editForm.category;

            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/auth/profile',
                {
                    fullName: editForm.fullName,
                    phone: editForm.phone,
                    address: editForm.address,
                    category: saveCategory,
                    bio: editForm.bio,
                    hourlyRate: editForm.hourlyRate
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const updatedUser = response.data;
            // Merge updated fields into current profile state
            const newProfileState = {
                ...profile,
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
                address: updatedUser.address || '',
                category: updatedUser.category,
                bio: updatedUser.bio,
                hourlyRate: updatedUser.hourlyRate
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
                    <p>Manage your profile and skills to attract more clients.</p>
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
                            <p>Profile Rating</p>
                            <h3>{profile.rating} <Star size={20} style={{ display: 'inline', fill: '#FBBF24', color: '#FBBF24' }} /></h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Jobs Completed</p>
                            <h3>{profile.completedJobs}</h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Hourly Rate</p>
                            <h3>Rs. {profile.hourlyRate}</h3>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <div className="stat-card-info">
                            <p>Verification</p>
                            <h3>
                                <span className={`badge ${profile.verified ? 'badge-green' : 'badge-yellow'}`}>
                                    {profile.verified ? 'Verified' : 'Pending'}
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

                    {/* Category and Location Row */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <Briefcase size={16} />
                                Category
                            </label>
                            
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <select
                                        value={isCustomCategory ? 'Other' : editForm.category}
                                        onChange={handleCategorySelect}
                                        className="form-select"
                                    >
                                        <option value="" disabled>Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="Other">Other (Add Custom)</option>
                                    </select>
                                    
                                    {isCustomCategory && (
                                        <input
                                            type="text"
                                            name="category"
                                            value={editForm.category}
                                            onChange={handleChange}
                                            placeholder="Enter your custom category"
                                            className="form-input"
                                            autoFocus
                                            required
                                        />
                                    )}
                                </div>
                            ) : (
                                <select
                                    name="category"
                                    value={profile.category}
                                    disabled={true}
                                    className="form-select"
                                >
                                    <option value="" disabled>No category set</option>
                                    {isCustomCategory ? (
                                        <option value={profile.category}>{profile.category}</option>
                                    ) : (
                                        CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))
                                    )}
                                    {/* Fallback option if current category not in list */}
                                    {!CATEGORIES.includes(profile.category) && !isCustomCategory && profile.category && (
                                        <option value={profile.category}>{profile.category}</option>
                                    )}
                                </select>
                            )}
                        </div>

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
                            />
                        </div>
                    </div>

                    {/* Hourly Rate */}
                    <div className="form-group">
                        <label className="form-label">Hourly Rate (NPR)</label>
                        <input
                            type="number"
                            name="hourlyRate"
                            value={isEditing ? editForm.hourlyRate : profile.hourlyRate}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-input"
                            min="0"
                        />
                    </div>

                    {/* Bio */}
                    <div className="form-group">
                        <label className="form-label">Bio</label>
                        <textarea
                            name="bio"
                            value={isEditing ? editForm.bio : profile.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="form-textarea"
                            placeholder="Tell clients about your skills and experience..."
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

export default FreelancerProfile;
