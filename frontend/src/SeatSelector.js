import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from './socket';
import './SeatSelector.css';

const SeatSelector = ({ event, isGuest, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [remotelyLockedSeats, setRemotelyLockedSeats] = useState([]);
  const [guestPhone, setGuestPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleSeatLocked = data => {
      if (data.eventId === event._id) setRemotelyLockedSeats(prev => [...prev, data.seatNumber]);
    };
    const handleSeatUnlocked = data => {
      if (data.eventId === event._id) setRemotelyLockedSeats(prev => prev.filter(seat => seat !== data.seatNumber));
    };
    socket.on('seat-is-now-locked', handleSeatLocked);
    socket.on('seat-is-now-unlocked', handleSeatUnlocked);
    return () => {
      socket.off('seat-is-now-locked', handleSeatLocked);
      socket.off('seat-is-now-unlocked', handleSeatUnlocked);
    };
  }, [event._id]);

  const handleSeatClick = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
      socket.emit('unlock-seat', { eventId: event._id, seatNumber });
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
      socket.emit('lock-seat', { eventId: event._id, seatNumber });
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return alert("Please select at least one seat.");
    if (isGuest && !guestPhone) return alert("Please enter your phone number to continue.");

    setIsProcessing(true);
    
    const url = isGuest 
        ? "http://localhost:5000/api/bookings/guest/create-stripe-session" 
        : "http://localhost:5000/api/bookings/create-stripe-session";

    const payload = {
        eventId: event._id,
        selectedSeats: selectedSeats,
        ...(isGuest && { phone: guestPhone })
    };

    try {
        const res = await axios.post(url, payload);
        window.location.href = res.data.url;
    } catch (error) {
        alert(error.response?.data?.message || "Checkout failed. Please try again.");
        setIsProcessing(false);
    }
  };

  const renderSeats = (start, end, isRightSide = false) => {
    let seats = [];
    for (let i = start; i <= end; i++) {
        const isBooked = event.bookedSeats.includes(i);
        const isLockedByOther = remotelyLockedSeats.includes(i);
        const isSelected = selectedSeats.includes(i);
        let seatClass = 'seat';
        if (isBooked || isLockedByOther) seatClass += ' booked';
        else if (isSelected) seatClass += ' selected';
        else seatClass += ' available';

        seats.push(
            <div key={i} className={seatClass} onClick={() => !(isBooked || isLockedByOther) && handleSeatClick(i)}>
                {i}
            </div>
        );
    }
    return <div className={`seat-column ${isRightSide ? 'right-col' : ''}`}>{seats}</div>;
  };

  return (
    <div className="modal-overlay">
        <div className="seat-selector-modal">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h2>Select Your Seats</h2>
            <div className="bus-layout">
                <div className="driver-seat">Driver</div>
                <div className="seats-container">
                    {renderSeats(1, 20)}
                    <div className="aisle"></div>
                    {renderSeats(21, 40, true)}
                </div>
            </div>
            
            {isGuest && (
                <div className="guest-input-container">
                    <input 
                        type="tel"
                        placeholder="Enter Your Phone Number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                    />
                </div>
            )}

            <div className="checkout-summary">
                <p>Selected Seats: <span>{selectedSeats.join(', ') || 'None'}</span></p>
                <p>Total: <span>${selectedSeats.length * event.price}</span></p>
            </div>

            <button className="checkout-button" onClick={handleCheckout} disabled={isProcessing || selectedSeats.length === 0}>
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
            </button>
        </div>
    </div>
  );
};
export default SeatSelector;