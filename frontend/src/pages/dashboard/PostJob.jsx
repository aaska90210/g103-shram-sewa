import { useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, FileText, Tag } from 'lucide-react';
import axios from 'axios';
import MapPicker from '../../components/MapPicker';


// Custom Nepali Rupees Icon Component
const NepaliRupeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₨</text>
    </svg>
);

const PostJob = () => {
    // === User Verification Check ===
    // Get user info from local storage to check verification status
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isVerified = user.verificationStatus === 'Verified';

    // === Form State ===
    // Tracks all input fields for the job posting form
    const [form, setForm] = useState({
        title: '',
        description: '',
        budget: '',
        location: '',
        category: '',
    });

    const [loading, setLoading] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);

      // === Map State ===
    const [pinCoords, setPinCoords] = useState(null);
    const [showMap, setShowMap] = useState(false);

    // === Handle Input Changes ===
    // Updates the form state when user types in any field
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // === Handle Category Change ===
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'Other') {
            setIsCustomCategory(true);
            setForm({ ...form, category: '' });
        } else {
            setIsCustomCategory(false);
            setForm({ ...form, category: value });
        }
    };

    // === Submit Handler ===
    // Posts the job to backend API
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isVerified) {
            toast.error('You need to be verified to post jobs.');
            return;
        }

        setLoading(true);

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login first');
                setLoading(false);
                return;
            }

              // Prepare Payload (Add map coordinates)
            const payload = { ...form };
            if (pinCoords) {
                payload.lat = pinCoords.lat;
                payload.lng = pinCoords.lng;
            }

            // Send job data to backend
            const response = await axios.post(
                'http://localhost:5000/api/jobs',
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Job posted successfully!');

            // Reset form
            setForm({ title: '', description: '', budget: '', location: '', category: '' });
            setPinCoords(null);
            setShowMap(false);

        } catch (error) {
            console.error('Error posting job:', error);
            const message = error.response?.data?.message || 'Failed to post job. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // === Preview Handler ===
    // Shows a preview of the job before posting
    const handlePreview = () => {
        if (!form.title || !form.category || !form.budget || !form.location || !form.description) {
            toast.error('Please fill in all fields first');
            return;
        }
        toast.info(`Preview: ${form.title} | ${form.category} | Rs. ${form.budget} | ${form.location}`);
    };

    return (
        <div>
            {/* === Page Header === */}
            {/* Top section with title and description */}
            <div className="page-header">
                <h1>Post a New Job</h1>
                <p>Fill in the details to hire a skilled worker.</p>
            </div>

            {/* === Form Card === */}
            {/* Centered white card (60% width) for focused layout */}
            <div className="form-card">
                {!isVerified && (
                    <div className="verification-alert" style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffeeba',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                        <div>
                            <h4 style={{ margin: 0, fontWeight: 'bold' }}>Account Not Verified</h4>
                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
                                You cannot post jobs until your account is verified by an admin. 
                                <br/>
                                Current Status: <strong>{user.verificationStatus || 'Pending'}</strong>
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ 
                    opacity: isVerified ? 1 : 0.6, 
                    pointerEvents: isVerified ? 'auto' : 'none',
                    filter: isVerified ? 'none' : 'grayscale(100%)'
                }}>
                    
                    {/* === Job Title Input (1-column layout) === */}
                    {/* Briefcase icon sits inside the input field on the left */}
                    <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <div className="input-wrapper">
                            <Briefcase />
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Need a Plumber for Kitchen"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* === Two-Column Row: Category and Budget === */}
                    {/* Side-by-side inputs for better space usage */}
                    <div className="form-row">
                        
                        {/* Category Dropdown with Tag icon */}
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div className="input-wrapper" style={{ marginBottom: isCustomCategory ? '0.5rem' : '0' }}>
                                <Tag size={20} />
                                <select
                                    name="categorySelect"
                                    value={isCustomCategory ? 'Other' : form.category}
                                    onChange={handleCategoryChange}
                                    required
                                    className="form-select"
                                >
                                    <option value="" disabled>Select category</option>
                                    <option value="Electrician">Electrician</option>
                                    <option value="Plumber">Plumber</option>
                                    <option value="Painter">Painter</option>
                                    <option value="Carpenter">Carpenter</option>
                                    <option value="Mason">Mason</option>
                                    <option value="Cleaner">Home Cleaner</option>
                                    <option value="Makeup">MUA</option>
                                    <option value="Other">Other (Add Custom)</option>
                                </select>
                            </div>
                            
                            {/* Custom Category Input (shown when 'Other' is selected) */}
                            {isCustomCategory && (
                                <div className="input-wrapper">
                                    <Tag size={20} style={{ opacity: 0.5 }} />
                                    <input
                                        type="text"
                                        name="category"
                                        placeholder="Enter custom category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* Budget Input with Nepali Rupees icon */}
                        <div className="form-group">
                            <label className="form-label">Budget (NPR)</label>
                            <div className="input-wrapper">
                                <NepaliRupeeIcon />
                                <input
                                    type="number"
                                    name="budget"
                                    placeholder="e.g. 2000"
                                    value={form.budget}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                        </div>

                    </div>

                    {/* === Location Input (1-column layout) === */}
                    {/* Map-Pin icon inside the input field */}
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <div className="input-wrapper">
                            <MapPin />
                            <input
                                type="text"
                                name="location"
                                placeholder="e.g. Kathmandu, Nepal"
                                value={form.location}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                     {/* === Map Pin Section === */}
                    <div className="form-group">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label className="form-label" style={{ margin: 0 }}>
                                Pin Exact Location on Map
                                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginLeft: 6 }}>(optional but helps workers find you)</span>
                            </label>
                            <button 
                                type="button" 
                                onClick={() => setShowMap(!showMap)} 
                                style={{ fontSize: 13, padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: showMap ? '#fee2e2' : 'white', cursor: 'pointer', color: '#374151' }}
                            >
                                {showMap ? 'Hide Map' : 'Open Map'}
                            </button>
                        </div>

                        {showMap && (
                            <MapPicker value={pinCoords} onChange={setPinCoords} height={260} />
                        )}

                        {pinCoords && (
                            <div style={{ marginTop: 6, padding: '6px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 13, color: '#166534' }}>
                                ✓ Location pinned: {pinCoords.lat.toFixed(4)}, {pinCoords.lng.toFixed(4)}
                            </div>
                        )}
                    </div>


                    {/* === Description Textarea (1-column layout) === */}
                    {/* Large text area for detailed job requirements */}
                    <div className="form-group">
                        <label className="form-label">
                            <FileText />
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Describe the job requirements in detail..."
                            value={form.description}
                            onChange={handleChange}
                            required
                            className="form-textarea"
                        />
                    </div>

                    {/* === Action Buttons === */}
                    {/* Preview (outline) and Post Job (solid red) buttons */}
                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={handlePreview}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            Preview Job
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                    
                </form>
            </div>
        </div>
    );
};

export default PostJob;
