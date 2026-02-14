import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaBuilding } from 'react-icons/fa';
import './AuthStyles.css';

// This is the Professional Register Page component.
// It handles user registration with a role toggle (Client vs. Freelancer).
const Register = () => {
    // --- STATE MANAGEMENT ---
    // checking the role to switch UI elements dynamically
    const [role, setRole] = useState('Client');

    // Object to store all form input values for cleaner state management
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        skill: '', // Only for Freelancer
    });

    // Handle Input Changes
    // We use this function to update the specific field in our formData object
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration Data:', { role, ...formData });
        alert(`Registration Successful as ${role}! Check console for data.`);
    };

    return (
        <div className="auth-container" style={{ maxWidth: '450px' }}>
            <h2>Create Account</h2>

            {/* --- ROLE TOGGLE SECTION --- */}
            <div className="role-toggle">
                {/* Toggle button for Client (Employer) */}
                <button
                    type="button"
                    className={`role-btn ${role === 'Client' ? 'active' : ''}`}
                    onClick={() => setRole('Client')}
                >
                    <FaBuilding style={{ marginRight: '8px' }} />
                    Client
                </button>

                {/* Toggle button for Freelancer (Worker) */}
                <button
                    type="button"
                    className={`role-btn ${role === 'Freelancer' ? 'active' : ''}`}
                    onClick={() => setRole('Freelancer')}
                >
                    <FaBriefcase style={{ marginRight: '8px' }} />
                    Freelancer
                </button>
            </div>

            {/* --- DYNAMIC INFO TEXT --- */}
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                {role === 'Client'
                    ? 'You are registering as an Employer to hire talent.'
                    : 'You are registering as a Freelancer to offer services.'}
            </p>

            {/* --- REGISTRATION FORM --- */}
            <form onSubmit={handleSubmit}>

                {/* Full Name Input with Icon */}
                <div className="input-box">
                    <span className="icon"><FaUser /></span>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Phone Input with Icon */}
                <div className="input-box">
                    <span className="icon"><FaPhone /></span>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Email Input with Icon */}
                <div className="input-box">
                    <span className="icon"><FaEnvelope /></span>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* CONDITIONAL RENDER: Primary Skill (Only for Freelancer) */}
                {role === 'Freelancer' && (
                    <div className="input-box">
                        <span className="icon"><FaBriefcase /></span>
                        <select
                            name="skill"
                            value={formData.skill}
                            onChange={handleChange}
                            className="styled-select"
                            required
                        >
                            <option value="" disabled>Select Primary Skill</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Painter">Painter</option>
                            <option value="Carpenter">Carpenter</option>
                            <option value="Mason">Mason</option>
                            <option value="Cleaner">Home Cleaner</option>
                            <option value="Makeup">MUA</option>
                        </select>
                    </div>
                )}

                {/* Password Input with Icon */}
                <div className="input-box">
                    <span className="icon"><FaLock /></span>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-btn">
                    Register
                </button>
            </form>

            {/* --- LOGIN LINK --- */}
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                Already have an account? <Link to="/login" className="toggle-link" style={{ display: 'inline' }}>Login here</Link>
            </p>
        </div>
    );
};

export default Register;
