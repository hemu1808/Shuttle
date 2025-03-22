import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from "socket.io";
import Razorpay from "razorpay";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Sample Route
app.get("/", (req, res) => res.send("Server Running!"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const io = new Server(5001, { cors: { origin: "*" } });

let lockedSeats = {};

io.on("connection", (socket) => {
  socket.on("lock-seat", (seatID) => {
    lockedSeats[seatID] = true;
    io.emit("update-seats", lockedSeats);
  });

  socket.on("release-seat", (seatID) => {
    delete lockedSeats[seatID];
    io.emit("update-seats", lockedSeats);
  });
});



const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_SECRET",
});

app.post("/payment", async (req, res) => {
  const payment = await razorpay.orders.create({
    amount: req.body.amount * 100,
    currency: "INR",
  });
  res.json(payment);
});
