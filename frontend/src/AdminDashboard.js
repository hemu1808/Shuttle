import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EventForm from './EventForm';
import { socket } from './socket'; // CORRECTED IMPORT PATH
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin/login');
    else fetchEvents();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`http://localhost:5000/api/admin/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEvents();
      } catch (error) {
        alert('Could not delete event.');
      }
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchEvents();
  };

  const handleSimulateDrive = (event) => {
      alert(`Simulating drive for ${event.name}. Check the main page map!`);
      let currentLat = event.lat;
      let currentLng = event.lng;
      
      const interval = setInterval(() => {
          currentLat += (Math.random() - 0.5) * 0.01; // Smaller, more realistic movements
          currentLng += (Math.random() - 0.5) * 0.01;
          socket.emit('update-shuttle-location', {
              eventId: event._id,
              lat: currentLat,
              lng: currentLng,
          });
      }, 2000);

      setTimeout(() => clearInterval(interval), 60000);
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <div className="dashboard-content">
        <h2>Manage Events</h2>
        <button className="create-btn" onClick={handleCreate}>+ Create New Event</button>
        <table className="events-table">
          <thead>
            <tr><th>Name</th><th>Date</th><th>Price (USD)</th><th>Seats</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>{event.name}</td>
                <td>{new Date(event.date).toLocaleString()}</td>
                <td>${event.price}</td>
                <td>{event.seats}</td>
                <td className="actions-cell">
                  <button className="edit-btn" onClick={() => handleEdit(event)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(event._id)}>Delete</button>
                  <button className="simulate-btn" onClick={() => handleSimulateDrive(event)}>Simulate Drive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <EventForm event={editingEvent} onSave={handleSave} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
export default AdminDashboard;