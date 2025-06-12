import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './ModernApp.css';

const BookingSuccessPage = () => {
    const [status, setStatus] = useState('confirming');
    const [booking, setBooking] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const confirmBooking = async () => {
            const sessionId = new URLSearchParams(location.search).get('session_id');
            if (!sessionId) {
                setStatus('error');
                return;
            }
            try {
                const res = await axios.post('http://localhost:5000/api/bookings/confirm-booking', { sessionId });
                setBooking(res.data.booking);
                setStatus('confirmed');
            } catch (error) {
                setStatus('error');
            }
        };
        confirmBooking();
    }, [location.search]);

    return (
        <div className="success-page-container">
            {status === 'confirming' && <h2>Confirming your booking...</h2>}
            {status === 'error' && <h2>❌ There was a problem confirming your booking.</h2>}
            {status === 'confirmed' && booking && (
                <div className="success-content">
                    <h1>✅ Booking Confirmed!</h1>
                    <p>Your ticket is ready. Present this QR code at the shuttle entry.</p>
                    <div className="confirmed-ticket">
                        <img src={booking.qrCode} alt="Your QR Code Ticket" />
                        <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                        <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
                    </div>
                    <Link to="/my-bookings" className="cta-link">View All My Bookings</Link>
                </div>
            )}
        </div>
    );
};
export default BookingSuccessPage;