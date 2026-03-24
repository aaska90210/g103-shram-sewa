import { useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, FileText, Tag } from 'lucide-react';
import axios from 'axios';


const handleRegister = async (e) => {
  e.preventDefault();

  const loading = toast.loading("Creating account...");

  try {

    toast.dismiss(loading);
    toast.success("Account created successfully ");

  } catch (error) {
    toast.dismiss(loading);
    toast.error("Registration failed ");
  }
};
// Custom Nepali Rupees Icon Component
const NepaliRupeeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <text x="4" y="18" fontSize="16" fontWeight="bold" fill="currentColor" stroke="none">₨</text>
    </svg>
);

const PostJob = () => {
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

    // === Handle Input Changes ===
    // Updates the form state when user types in any field
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // === Submit Handler ===
    // Posts the job to backend API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login first');
                setLoading(false);
                return;
            }

            // Send job data to backend
            const response = await axios.post(
                'http://localhost:5000/api/jobs',
                form,
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
                <form onSubmit={handleSubmit}>
                    
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
                            <div className="input-wrapper">
                                <Tag />
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
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
                                </select>
                            </div>
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
