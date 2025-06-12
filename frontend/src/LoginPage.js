import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './App';
import './AuthForm.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.token);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Welcome Back</h2>
                <p>Login to book your next shuttle ride.</p>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="auth-btn">Login</button>
                </form>
                <p className="switch-auth">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};
export default LoginPage;