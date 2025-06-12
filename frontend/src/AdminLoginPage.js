import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', background: '#fff', borderRadius: '8px' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}/>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '4px' }}>Login</button>
      </form>
    </div>
  );
};
export default AdminLoginPage;