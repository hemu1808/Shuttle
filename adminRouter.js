import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from './models/Admin.js';
import Event from './models/Event.js';
import authMiddleware from './middleware/authMiddleware.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// CRUD OPERATIONS
router.post('/events', authMiddleware, async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error });
  }
});
router.put('/events/:id', authMiddleware, async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error });
  }
});
router.delete('/events/:id', authMiddleware, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error });
  }
});

export default router;