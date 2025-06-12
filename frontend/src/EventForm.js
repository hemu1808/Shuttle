import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';

const EventForm = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState({ 
      name: '', date: '', 
      location: '', lat: '', lng: '', 
      destinationName: '', destinationLat: '', destinationLng: '',
      price: '', seats: '' 
  });
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'], // Load the places library for Autocomplete
  });

  // Refs to hold the autocomplete instances
  const originAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        location: event.location || '',
        lat: event.lat || '',
        lng: event.lng || '',
        destinationName: event.destinationName || '',
        destinationLat: event.destinationLat || '',
        destinationLng: event.destinationLng || '',
        price: event.price || '',
        seats: event.seats || ''
      });
    } else {
      setFormData({ name: '', date: '', location: '', lat: '', lng: '', destinationName: '', destinationLat: '', destinationLng: '', price: '', seats: '' });
    }
  }, [event]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlaceSelect = (autocomplete, fieldPrefix) => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setFormData(prev => ({
        ...prev,
        [`${fieldPrefix}Name`]: place.name,
        [`${fieldPrefix === 'destination' ? 'destinationL' : 'l'}at`]: place.geometry.location.lat(),
        [`${fieldPrefix === 'destination' ? 'destinationL' : 'l'}ng`]: place.geometry.location.lng(),
      }));
    } else {
      console.error('Autocomplete is not loaded yet!');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (event) {
        await axios.put(`http://localhost:5000/api/admin/events/${event._id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/admin/events', formData, config);
      }
      onSave();
    } catch (error) {
      alert('Error saving event.');
    }
  };

  if (!isLoaded) return <div>Loading form...</div>;

  return (
    <div className="modal-overlay">
      <div className="form-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
        <form onSubmit={handleSubmit} className="event-form-grid">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Event Name" required className="full-width"/>
          <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} required className="full-width"/>
          
          <Autocomplete
            onLoad={(autocomplete) => originAutocompleteRef.current = autocomplete}
            onPlaceChanged={() => handlePlaceSelect(originAutocompleteRef.current, 'location')}
            className="full-width"
          >
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Origin Name (e.g., Pittsburgh, PA)" required />
          </Autocomplete>
          
          <Autocomplete
            onLoad={(autocomplete) => destinationAutocompleteRef.current = autocomplete}
            onPlaceChanged={() => handlePlaceSelect(destinationAutocompleteRef.current, 'destination')}
            className="full-width"
          >
            <input name="destinationName" value={formData.destinationName} onChange={handleChange} placeholder="Destination Name (e.g., New York, NY)" required />
          </Autocomplete>

          <input name="price" type="number" min="1" value={formData.price} onChange={handleChange} placeholder="Price (USD)" required />
          <input name="seats" type="number" min="1" value={formData.seats} onChange={handleChange} placeholder="Total Seats" required />
          
          <button type="submit" className="save-btn full-width">{event ? 'Update Event' : 'Create Event'}</button>
        </form>
      </div>
    </div>
  );
};
export default EventForm;