// src/SeatSelector.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./SeatSelector.css";

const TOTAL_SEATS = 20; // Change this as per event configuration

function SeatSelector({ event, onClose }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);

  useEffect(() => {
    const socket = require("socket.io-client")("http://localhost:5001");
    socket.on("seat-locked", ({ eventId, seatNumber }) => {
      if (eventId === event._id) {
        setLockedSeats(prev => [...new Set([...prev, seatNumber])]);
      }
    });
    return () => socket.disconnect();
  }, [event._id]);

  const toggleSeat = async (seat) => {
    if (event.bookedSeats.includes(seat) || lockedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat));
    } else {
      setSelectedSeats(prev => [...prev, seat]);
      try {
        await axios.post("http://localhost:5000/lock-seat", { eventId: event._id, seatNumber: seat });
      } catch (err) {
        alert("Seat lock failed");
      }
    }
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return alert("Please select at least one seat.");
    try {
      const res = await axios.post("http://localhost:5000/create-stripe-session", {
        eventId: event._id,
        selectedSeats,
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert("Stripe session creation failed.");
    }
  };

  return (
    <div className="seat-modal">
      <div className="seat-content">
        <h3>{event.name} – Seat Selection</h3>
        <div className="seat-grid">
          {[...Array(TOTAL_SEATS)].map((_, i) => {
            const seat = i + 1;
            const isBooked = event.bookedSeats.includes(seat);
            const isLocked = lockedSeats.includes(seat);
            const isSelected = selectedSeats.includes(seat);

            return (
              <motion.div
                key={seat}
                className={`seat ${isBooked ? "booked" : isLocked ? "locked" : isSelected ? "selected" : "available"}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSeat(seat)}
              >
                {seat}
              </motion.div>
            );
          })}
        </div>
        <div className="seat-actions">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleCheckout} className="btn-primary">Checkout</button>
        </div>
      </div>
    </div>
  );
}

export default SeatSelector;
