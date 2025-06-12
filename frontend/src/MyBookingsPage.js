import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ModernApp.css';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/bookings/my-bookings');
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="page-container">Loading your bookings...</div>;

    return (
        <div className="page-container">
            <header className="page-header">
                <h1>My Bookings</h1>
                <Link to="/" className="back-link">← Back to Events</Link>
            </header>
            <div className="bookings-grid">
                {bookings.length === 0 ? (
                    <p>You have no bookings yet.</p>
                ) : (
                    bookings.map(booking => (
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
                    ))
                )}
            </div>
        </div>
    );
};
export default MyBookingsPage;