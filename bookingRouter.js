import express from 'express';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import userAuthMiddleware from './middleware/userAuthMiddleware.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// --- Logged-in User Routes ---
router.get('/my-bookings', userAuthMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('event').sort({ bookedAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/create-stripe-session', userAuthMiddleware, async (req, res) => {
    const { eventId, selectedSeats } = req.body;
    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        // Final validation check before payment
        const isUnavailable = selectedSeats.some(seat => event.bookedSeats.includes(seat));
        if (isUnavailable) return res.status(409).json({ message: 'One or more selected seats are no longer available.' });
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency: 'usd', product_data: { name: `${event.name} Ticket` }, unit_amount: event.price * 100 }, quantity: selectedSeats.length }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/`,
            metadata: { userId: req.user.id, eventId, seats: selectedSeats.join(','), isGuest: 'false' }
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ message: 'Could not create Stripe session' });
    }
});

// --- Guest Routes ---
router.post('/guest/create-stripe-session', async (req, res) => {
    const { eventId, selectedSeats, phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required for guest checkout.' });
    try {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        // Final validation check before payment
        const isUnavailable = selectedSeats.some(seat => event.bookedSeats.includes(seat));
        if (isUnavailable) return res.status(409).json({ message: 'One or more selected seats are no longer available.' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency: 'usd', product_data: { name: `${event.name} Ticket` }, unit_amount: event.price * 100 }, quantity: selectedSeats.length }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/`,
            metadata: { guestPhone: phone, eventId, seats: selectedSeats.join(','), isGuest: 'true' }
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ message: 'Could not create guest Stripe session' });
    }
});

router.post('/find-by-phone', async (req, res) => {
    try {
        const bookings = await Booking.find({ guestPhone: req.body.phone }).populate('event').sort({ bookedAt: -1 });
        if (!bookings.length) return res.status(404).json({ message: 'No bookings found for this phone number.' });
        res.json(bookings);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- Universal Confirmation Route ---
router.post('/confirm-booking', async (req, res) => {
    const { sessionId } = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid') return res.status(400).json({ message: 'Payment not successful' });

        const existingBooking = await Booking.findOne({ bookingId: session.id });
        if (existingBooking) return res.status(200).json({ booking: existingBooking });

        const { eventId, seats, userId, guestPhone, isGuest } = session.metadata;
        const seatArray = seats.split(',').map(Number);
        
        await Event.findByIdAndUpdate(eventId, { $push: { bookedSeats: { $each: seatArray } } });
        
        const bookingData = {
            event: eventId,
            seats: seatArray,
            bookingId: session.id,
            ...(isGuest === 'true' ? { guestPhone } : { user: userId })
        };
        
        const newBooking = new Booking(bookingData);
        newBooking.qrCode = await QRCode.toDataURL(newBooking._id.toString());
        await newBooking.save();

        res.status(201).json({ booking: newBooking });
    } catch (err) {
        res.status(500).json({ message: 'Booking confirmation failed.' });
    }
});

export default router;