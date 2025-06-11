import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Event from "./models/Event.js";
import stripePackage from "stripe";
import { Server } from "socket.io";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

let io;
export const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

// Get all events
router.get("/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Seat Lock
router.post("/lock-seat", async (req, res) => {
  const { eventId, seatNumber } = req.body;
  try {
    const event = await Event.findById(eventId);
    if (!event || event.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ message: "Seat already booked or invalid event." });
    }

    io.emit("seat-locked", { eventId, seatNumber });
    res.status(200).json({ message: "Seat locked." });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

// Stripe Checkout
router.post("/create-stripe-session", async (req, res) => {
  const { eventId, selectedSeats } = req.body;
  try {
    const event = await Event.findById(eventId);
    const unavailable = selectedSeats.some(seat => event.bookedSeats.includes(seat));
    if (unavailable) return res.status(409).json({ message: "One or more seats are already booked." });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${event.name} Tickets`,
            },
            unit_amount: event.price * 100 * selectedSeats.length,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?eventId=${eventId}&seats=${selectedSeats.join(",")}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stripe session error." });
  }
});

// Confirm Booking
router.post("/confirm-booking", async (req, res) => {
  const { eventId, seats } = req.body;
  try {
    const event = await Event.findById(eventId);
    const duplicates = seats.filter(seat => event.bookedSeats.includes(seat));
    if (duplicates.length > 0) return res.status(409).json({ message: "Some seats already booked." });

    event.bookedSeats.push(...seats);
    await event.save();

    io.emit("update-seats", await Event.find());
    res.status(200).json({ message: "Booking confirmed." });
  } catch (err) {
    res.status(500).json({ message: "Booking failed." });
  }
});

//module.exports = { router, setSocketInstance };
//module.exports = router;
//const mongoose = require("mongoose"); 
export default router;