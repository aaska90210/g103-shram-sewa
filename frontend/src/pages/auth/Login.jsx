import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import toaster

import './AuthStyles.css';

// Login Page Component
const Login = () => {
    const navigate = useNavigate(); // Helper to change pages
    const [identifier, setIdentifier] = useState(''); // This is the email
    const [password, setPassword] = useState('');

    // We don't need a local error state anymore, we use toast directly 
    // const [error, setError] = useState(''); 

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Simple validation
        if (!identifier || !password) {
            toast.error('Please fill in all fields.');
            return;
        }

        try {
            // 2. Send data to backend
            // We use axios to make the POST request
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: identifier,
                password: password
            });

            // 3. If successful, we get data back
            const { token, role, user } = response.data;

            // 4. Show success message
            toast.success(`Welcome back, ${user.fullName}!`);

            // 5. Store token and user data (so we stay logged in and can show user name)
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('user', JSON.stringify({ 
                name: user.fullName, 
                verificationStatus: user.verificationStatus,
                isVerified: user.isVerified 
            })); 

            // 6. Redirect based on role
            if (role === 'Client') {
                navigate('/hirer/dashboard');
            } else if (role === 'Freelancer') {
                navigate('/worker/dashboard');
            } else if (role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                toast.error('Unknown role, contact support.');
            }

        } catch (err) {
            // 7. Handle errors
            console.error(err);
            // If backend sends an error message, show it. Otherwise show generic error.
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        }
    };

    return (
        <div className="auth-container" style={{ maxWidth: '400px' }}>
            <h2>Welcome Back</h2>

            {/* We removed the error paragraph because we use toast now */}

            <form onSubmit={handleSubmit}>

                {/* Identifier Input (Email) */}
                <div className="input-box">
                    <span className="icon"><FaUser /></span>
                    <input
                        type="email" // Changed to email type for better validation
                        placeholder="Email Address"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="input-box">
                    <span className="icon"><FaLock /></span>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                    Login
                </button>
            </form>

            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                Don't have an account? <Link to="/register" className="toggle-link" style={{ display: 'inline' }}>Register here</Link>
            </p>
        </div>
    );
};

export default Login;
