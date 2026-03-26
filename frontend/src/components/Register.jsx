import React, { useState } from 'react';

// This is our Register Component.
// This component lets users create a new account in our application.
// We use "onLoginClick" to let the user switch back to the Login screen.
function Register({ onLoginClick }) {
    // --- STATE FOR INPUT DATA ---
    // We define separate state variables for each piece of information we need:
    // "fullName" stores the user's name.
    // "phone" stores the phone number.
    // "email" stores the user's email address.
    // "role" tells us if they are a Client (hiring) or a Freelancer (working).
    // "password" is for their account security.
    // "error" displays any issues during sign-up.

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Client'); // Defaulting to Client, simple string.
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // --- HANDLE SUBMISSION ---
    // This function is triggered when the user clicks "Register".
    const handleSubmit = (e) => {
        e.preventDefault(); // Stop default form submission.

        // Basic validation: Check if required fields are empty.
        if (!fullName || !phone || !email || !password) {
            setError('Please fill in all mandatory fields.');
            return;
        }

        // Clear any previous error message.
        setError('');

        // In a real application, you would send this data to your backend API.
        // For now, we simulate success and log the data.
        console.log('Registration Data:', {
            fullName,
            phone,
            email,
            role,
            password
        });

        alert('Account created successfully! (Check console for data)');
    };

    return (
        // Reusing the "auth-container" styling from index.css for consistency.
        <div className="auth-container">
            <h2>Create Account</h2>

            {/* Error Message display */}
            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                {/* Full Name Input */}
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                {/* Phone Number Input */}
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        placeholder="Your mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                {/* Email Input */}
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Role Selection (Toggle) */}
                <div className="form-group">
                    <label>I want to join as a:</label>
                    <div className="role-toggle">
                        {/*
              Client Button: Used for people hiring services.
              Currently selected if 'role' equals 'Client'.
              We change the class to 'active' if selected for styling.
            */}
                        <button
                            type="button"
                            className={`role-btn ${role === 'Client' ? 'active' : ''}`}
                            onClick={() => setRole('Client')}
                        >
                            Client (Hirer)
                        </button>
                        {/*
              Freelancer Button: Used for people offering services.
              Here "Freelancer" is often called "Worker" in Shram Sewa likely.
            */}
                        <button
                            type="button"
                            className={`role-btn ${role === 'Freelancer' ? 'active' : ''}`}
                            onClick={() => setRole('Freelancer')}
                        >
                            Freelancer (Worker)
                        </button>
                    </div>
                </div>

                {/* Password Input */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <button type="submit">Register</button>
            </form>

            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                Already have an account? <span className="toggle-link" onClick={onLoginClick}>Login here</span>
            </p>
        </div>
    );
}

export default Register;

