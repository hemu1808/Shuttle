import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// --- Components ---
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MyBookingsPage from './MyBookingsPage';
import BookingSuccessPage from './BookingSuccessPage';
import FindBookingPage from './FindBookingPage'; // NEW
import AdminLoginPage from './AdminLoginPage';
import AdminDashboard from './AdminDashboard';

// --- CSS ---
import './ModernApp.css'; 

// --- Auth Context ---
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({ id: decoded.user.id, token });
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                 localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({ id: decoded.user.id, token });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = { user, login, logout, isAuthenticated: !!user };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// --- Main App Component ---
function App() {
  return (
    <Router>
        <AuthProvider>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/find-booking" element={<FindBookingPage />} />
                <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
                <Route path="/booking-success" element={<BookingSuccessPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
            </Routes>
        </AuthProvider>
    </Router>
  );
}

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default App;