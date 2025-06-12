import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ModernApp.css'; // Shared styles

const FindBookingPage = () => {
    const [phone, setPhone] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await axios.post('http://localhost:5000/api/bookings/find-by-phone', { phone });
            setBookings(res.data);
        } catch (err) {
            setBookings([]);
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>Find My Booking</h1>
                <Link to="/" className="back-link">← Back to Events</Link>
            </header>
            <div className="auth-form" style={{ maxWidth: '600px' }}>
                <p>Enter the phone number you used to book as a guest to find your tickets.</p>
                <form onSubmit={handleSearch}>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your Phone Number" required />
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Searching...' : 'Find My Tickets'}
                    </button>
                </form>
            </div>

            <div className="bookings-grid" style={{ marginTop: '2rem' }}>
                {loading && <p>Searching for bookings...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && searched && bookings.length === 0 && <p>No bookings found for that number.</p>}
                {bookings.map(booking => (
                    <div key={booking._id} className="ticket-card">
                        <div className="ticket-details">
                            <h3>{booking.event.name}</h3>
                            <p><strong>Date:</strong> {new Date(booking.event.date).toLocaleString()}</p>
                            <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
                            <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                        </div>
                        <div className="ticket-qr">
                            <img src={booking.qrCode} alt="Booking QR Code" />
                            <span>Scan at Entry</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FindBookingPage;