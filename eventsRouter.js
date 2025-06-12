import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Event from "./models/Event.js";

const router = express.Router();
let io;

export const setSocketInstance = (socketInstance) => {
  io = socketInstance;
};

// GET all events (Public)
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching events." });
  }
});

export default router;