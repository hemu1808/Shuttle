import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'A user with this email already exists.' });

        user = new User({ email, password });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error during registration. Please try again later.'});
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;