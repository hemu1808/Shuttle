import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";
import { FaMapMarkerAlt, FaCalendarAlt, FaBus, FaMoneyBillWave, FaSun, FaMoon } from "react-icons/fa";
import { motion } from "framer-motion";
import SeatSelector from "./SeatSelector";

const socket = io("http://localhost:5001");

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    axios.get("http://localhost:5000/events").then(res => setEvents(res.data));
    socket.on("update-seats", updatedEvents => setEvents(updatedEvents));
    return () => socket.off("update-seats");
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const updated = !prev;
      localStorage.setItem("darkMode", updated);
      return updated;
    });
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <header className="app-header">
        <FaBus size={32} />
        <h1>Shuttle Now</h1>
        <p>Book your transit to your destination, instantly.</p>
        <div className="toggle-theme" onClick={toggleDarkMode}>
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </div>
      </header>

      <section className="map-container">
        <iframe
          title="Transit Map"
          src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=bus+station"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>

      <h2 className="event-title">Upcoming Shuttle Events</h2>

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">No upcoming events</p>
        ) : (
          events.map(event => (
            <motion.div
              key={event._id}
              className="event-card"
              whileHover={{ scale: 1.04 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3>{event.name}</h3>
              <p><FaCalendarAlt /> {event.date ? new Date(event.date).toLocaleString() : "TBA"}</p>
              <p><FaMapMarkerAlt /> Pickup Location: {event.location || "Central Station"}</p>
              <p><strong>Seats:</strong> {event.seats}</p>
              <p><FaMoneyBillWave /> ₹{event.price}</p>

              <div className="button-group">
                <button className="btn-primary" onClick={() => setSelectedEvent(event)}>
                  Book Now
                </button>
                <button className="btn-secondary">View Details</button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selectedEvent && (
        <SeatSelector
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default App;
