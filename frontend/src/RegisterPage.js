import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './App';
import './AuthForm.css';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { email, password });
            login(res.data.token);
            navigate('/');
        } catch (err) {
            // Display the specific error message sent from the backend
            setError(err.response?.data?.message || 'An unknown error occurred during registration.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Create Your Account</h2>
                <p>Sign up to get started with ShuttleNow.</p>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="auth-btn">Create Account</button>
                </form>
                <p className="switch-auth">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;