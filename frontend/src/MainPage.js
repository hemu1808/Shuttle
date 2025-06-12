import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { FaBus, FaRegCalendarAlt, FaMapPin, FaUsers, FaSun, FaMoon, FaTicketAlt, FaUserCircle, FaSearch } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './App';
import { socket } from './socket';
import SeatSelector from './SeatSelector';

const MainPage = () => {
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [bookingFlow, setBookingFlow] = useState({ event: null, isGuest: false });
  const [shuttleLocations, setShuttleLocations] = useState({});
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  useEffect(() => {
    axios.get("http://localhost:5000/events")
      .then(res => {
        setEvents(res.data);
        if(res.data.length > 0) setActiveEvent(res.data[0]);
      })
      .catch(err => console.error("Failed to fetch events:", err));

    socket.on("update-seats", setEvents);
    socket.on('all-shuttle-locations', setShuttleLocations);
    socket.on('shuttle-location-update', (data) => {
      setShuttleLocations(prev => ({ ...prev, [data.eventId]: { lat: data.lat, lng: data.lng } }));
    });

    return () => {
      socket.off("update-seats");
      socket.off('all-shuttle-locations');
      socket.off('shuttle-location-update');
    };
  }, []);

  const startBooking = (event, isGuestFlow) => {
      if (!isAuthenticated && !isGuestFlow) {
          navigate('/login');
      } else {
          setBookingFlow({ event, isGuest: isGuestFlow });
      }
  };

  return (
    <div className={`main-container ${darkMode ? 'dark-theme' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <FaBus className="logo-icon" />
          <h1>ShuttleNow</h1>
        </div>
        <nav className="main-nav">
            {isAuthenticated ? (
                <>
                    <Link to="/my-bookings" className="nav-item"><FaTicketAlt /> My Bookings</Link>
                    <button onClick={logout} className="nav-item button"><FaUserCircle /> Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login" className="nav-item"><FaUserCircle /> Login / Sign Up</Link>
                    <Link to="/find-booking" className="nav-item"><FaSearch /> Find My Booking</Link>
                </>
            )}
        </nav>
        <div className="event-list">
          <h2 className="list-title">Upcoming Shuttles</h2>
          {events.map(event => (
            <EventCard 
              key={event._id}
              event={event}
              isActive={activeEvent?._id === event._id}
              onClick={() => setActiveEvent(event)}
            />
          ))}
        </div>
        <div className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun/> : <FaMoon/>}
        </div>
      </aside>
      <main className="main-content">
        <Map activeEvent={activeEvent} shuttleLocations={shuttleLocations} />
        {activeEvent && <EventDetailPanel event={activeEvent} onBookNow={() => startBooking(activeEvent, false)} onBookAsGuest={() => startBooking(activeEvent, true)} />}
      </main>
      <AnimatePresence>
        {bookingFlow.event && (
            <SeatSelector
                event={bookingFlow.event}
                isGuest={bookingFlow.isGuest}
                onClose={() => setBookingFlow({ event: null, isGuest: false })}
            />
        )}
      </AnimatePresence>
    </div>
  );
}

const EventCard = ({ event, isActive, onClick }) => (
    <motion.div className={`event-card ${isActive ? 'active' : ''}`} onClick={onClick} layoutId={`event-card-${event._id}`}>
      <h3 className="event-name">{event.name}</h3>
      <div className="event-details"><p><FaRegCalendarAlt /> {new Date(event.date).toLocaleDateString()}</p><p><FaMapPin /> {event.location}</p></div>
      <div className="event-footer"><span className="price">${event.price}</span><span className="seats"><FaUsers /> {event.seats - event.bookedSeats.length} left</span></div>
    </motion.div>
);

const EventDetailPanel = ({ event, onBookNow, onBookAsGuest }) => (
    <motion.div className="event-detail-panel" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', stiffness: 200, damping: 25 }}>
        <h2>{event.name}</h2>
        <div className="detail-grid">
            <div><strong>Departs:</strong> {new Date(event.date).toLocaleString()}</div>
            <div><strong>From:</strong> {event.location}</div>
            <div><strong>Price:</strong> ${event.price} per seat</div>
            <div><strong>Available:</strong> {event.seats - event.bookedSeats.length} / {event.seats} seats</div>
        </div>
        <p className="event-description">Join us for a comfortable and scenic shuttle ride. Book your seat now to guarantee your spot!</p>
        <div className="booking-actions">
            <button className="book-now-btn" onClick={onBookNow}>Book & Save to Profile</button>
            <button className="book-guest-btn" onClick={onBookAsGuest}>Continue as Guest</button>
        </div>
    </motion.div>
);

// --- MAP COMPONENT ---
const Map = ({ activeEvent, shuttleLocations }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState(null);
  const mapRef = React.useRef(null);
  const shuttleLocation = activeEvent && shuttleLocations[activeEvent._id] ? shuttleLocations[activeEvent._id] : null;
  
  useEffect(() => {
    if (
        !activeEvent || 
        !activeEvent.lat || 
        !activeEvent.lng || 
        !activeEvent.destinationLat || 
        !activeEvent.destinationLng || 
        !window.google
    ) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
        origin: { lat: activeEvent.lat, lng: activeEvent.lng },
        destination: { lat: activeEvent.destinationLat, lng: activeEvent.destinationLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
        } else {
            console.error(`Error fetching directions: ${status}`);
            setDirections(null);
        }
    });

  }, [activeEvent]);

  const onMapLoad = useCallback(map => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) return <div className="map-container loading">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerClassName="map-container"
      center={activeEvent ? { lat: activeEvent.lat, lng: activeEvent.lng } : { lat: 40.7128, lng: -74.0060 }}
      zoom={7}
      onLoad={onMapLoad}
      options={{ disableDefaultUI: true, zoomControl: true }}
    >
      {directions && (
        <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#3b82f6', strokeWeight: 5 } }} />
      )}
      
      {activeEvent && activeEvent.lat && <MarkerF position={{ lat: activeEvent.lat, lng: activeEvent.lng }} label="A" title="Origin" />}
      {activeEvent && activeEvent.destinationLat && <MarkerF position={{ lat: activeEvent.destinationLat, lng: activeEvent.destinationLng }} label="B" title="Destination" />}

      {shuttleLocation && <MarkerF position={shuttleLocation} title="Shuttle" icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/bus.png' }} />}
    </GoogleMap>
  );
};

export default MainPage;