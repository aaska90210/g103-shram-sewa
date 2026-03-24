import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

import './AuthStyles.css';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // prepare payload (backend expects fullName, email, password, role)
        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: role,
            // phone: formData.phone, // Sending just in case backend is updated later
            // skill: role === 'Freelancer' ? formData.skill : undefined
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
                        placeholder="Phone Number"
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
