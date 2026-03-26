
import React, { useState } from 'react';

// This is our Login Component.
// A "Component" in React is like a custom HTML tag that we can reuse.
// We accept a prop called "onRegisterClick" so the parent component (App) can handle the screen switch.
function Login({ onRegisterClick }) {
    // --- STATE FOR INPUT DATA ---
    // We use the "useState" hook to store the data the user types into the form.
    // "identifier" will hold either the Email or Phone Number.
    // "password" will hold the user's password.
    // "error" will be used to show a message if something is wrong.
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // --- HANDLE SUBMISSION ---
    // This function runs when the user clicks the "Login" button.
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the page from reloading.

        // Simple validation: Ensure both fields are filled.
        if (!identifier || !password) {
            setError('Please fill in all fields.'); // Show an error message.
            return;
        }

        // Clear any previous error message.
        setError('');

        // For now, we just log the data to the console to see if it works.
        // In a real app, you would send this data to your backend server here.
        console.log('Login Attempt:', { identifier, password });

        // You could also show a success message or redirect the user.
        alert('Login capability is not yet connected to the backend, but your input was captured!');
    };

    return (
        // This outer div is our "Card" container found in index.css
        <div className="auth-container">
            <h2>Welcome Back</h2>

            {/* If there is an error message, display it here in red */}
            {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                {/* Email or Phone Input */}
                <div className="form-group">
                    <label htmlFor="identifier">Email or Phone Number</label>
                    <input
                        type="text"
                        id="identifier"
                        placeholder="e.g., user@example.com OR 9801234567"
                        value={identifier}
                        // Update our state whenever the user types
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                </div>

                {/* Password Input */}
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        // Update our state whenever the user types
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <button type="submit">Login</button>
            </form>

            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                Don't have an account? <span className="toggle-link" onClick={onRegisterClick}>Register here</span>
            </p>
        </div>
    );
}

export default Login;

