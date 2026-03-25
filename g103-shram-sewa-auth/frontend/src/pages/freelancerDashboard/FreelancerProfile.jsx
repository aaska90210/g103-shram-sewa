import { User, Star, Briefcase, MapPin, Phone, Mail, Edit } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Availability from './Availability';

const FreelancerProfile = () => {
    // === Profile State ===
    const [profile, setProfile] = useState({
        fullName: 'Worker Name',
        email: 'worker@example.com',
        phone: '+977 9812345678',
        location: 'Kathmandu, Nepal',
        category: 'Electrician',
        bio: 'Experienced electrician with 5+ years in residential and commercial work.',
        hourlyRate: 500,
        rating: 4.5,
        completedJobs: 12,
        verified: true
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...profile });

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
            // TODO: Implement API call to update profile
            setProfile({ ...editForm });
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

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
                            <select
                                name="category"
                                value={isEditing ? editForm.category : profile.category}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="form-select"
                            >
                                <option value="Electrician">Electrician</option>
                                <option value="Plumber">Plumber</option>
                                <option value="Painter">Painter</option>
                                <option value="Carpenter">Carpenter</option>
                                <option value="Mason">Mason</option>
                                <option value="Cleaner">Home Cleaner</option>
                                <option value="Makeup">MUA</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <MapPin size={16} />
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={isEditing ? editForm.location : profile.location}
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

            {/* === Embedded Availability Calendar === */}
            <hr style={{ margin: '3rem 0', borderColor: '#E5E7EB' }} />
            <Availability />
        </div>
    );
};

export default FreelancerProfile;
