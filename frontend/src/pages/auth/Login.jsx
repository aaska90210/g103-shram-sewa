import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import './AuthStyles.css';

// Login Page Component
const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!identifier || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        console.log('Login Attempt:', { identifier, password });
        alert('Logged in (simulated)!');
    };

    return (
        <div className="auth-container" style={{ maxWidth: '400px' }}>
            <h2>Welcome Back</h2>

            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                {/* Identifier Input (Email/Phone) */}
                <div className="input-box">
                    <span className="icon"><FaUser /></span>
                    <input
                        type="text"
                        placeholder="Email or Phone Number"
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
