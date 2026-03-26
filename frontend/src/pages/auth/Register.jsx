import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import './AuthStyles.css';

// Register page (Client / Freelancer)
const Register = () => {
    const navigate = useNavigate();

    // state
    const [role, setRole] = useState('Client');

    // form state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        skill: '', // Only for Freelancer
    });

    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'Other') {
            setIsCustomCategory(true);
            setFormData({ ...formData, skill: '' });
        } else {
            setIsCustomCategory(false);
            setFormData({ ...formData, skill: value });
        }
    };

    // submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Phone Number Validation
        if (!/^9\d{9}$/.test(formData.phone)) {
            toast.error('Phone number must be 10 digits and start with 9');
            return;
        }

        // prepare payload
        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role,
            phone: formData.phone,
            category: role === 'Freelancer' ? formData.skill : undefined
        };

        try {
            // send request
            const response = await axios.post('http://localhost:5000/api/auth/register', payload);

            toast.success('Registration Successful!');
            navigate('/login');
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Registration failed.';
            toast.error(message);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '450px' }}>
            <h2>Create Account</h2>

            {/* role toggle */}
            <div className="role-toggle">
                {/* Client */}
                <button
                    type="button"
                    className={`role-btn ${role === 'Client' ? 'active' : ''}`}
                    onClick={() => setRole('Client')}
                >
                    <FaBuilding style={{ marginRight: '8px' }} />
                    Client
                </button>

                {/* Freelancer */}
                <button
                    type="button"
                    className={`role-btn ${role === 'Freelancer' ? 'active' : ''}`}
                    onClick={() => setRole('Freelancer')}
                >
                    <FaBriefcase style={{ marginRight: '8px' }} />
                    Freelancer
                </button>
            </div>

            {/* helper text */}
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                {role === 'Client'
                    ? 'You are registering as an Employer to hire talent.'
                    : 'You are registering as a Freelancer to offer services.'}
            </p>

            {/* registration form */}
            <form onSubmit={handleSubmit}>

                {/* full name */}
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

                {/* phone */}
                <div className="input-box">
                    <span className="icon"><FaPhone /></span>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number (e.g. 9XXXXXXXXX)"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* email */}
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

                {/* skill (freelancer only) */}
                {role === 'Freelancer' && (
                    <>
                        <div className="input-box">
                            <span className="icon"><FaBriefcase /></span>
                            <select
                                name="skill"
                                value={isCustomCategory ? 'Other' : formData.skill}
                                onChange={handleCategoryChange}
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
                                <option value="Other">Other (Add Custom)</option>
                            </select>
                        </div>
                        
                        {/* Custom Category Input */}
                        {isCustomCategory && (
                            <div className="input-box">
                                <span className="icon"><FaBriefcase style={{ opacity: 0.5 }} /></span>
                                <input
                                    type="text"
                                    name="skill"
                                    placeholder="Enter custom category"
                                    value={formData.skill}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>
                        )}
                    </>
                )}

                {/* password */}
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

                {/* submit */}
                <button type="submit" className="submit-btn">
                    Register
                </button>
            </form>

            {/* login link */}
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                Already have an account? <Link to="/login" className="toggle-link" style={{ display: 'inline' }}>Login here</Link>
            </p>
        </div>
    );
};

export default Register;
