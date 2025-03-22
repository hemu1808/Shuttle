import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userID: String,
  eventID: String,
  seatID: String,
  paymentStatus: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", BookingSchema);
