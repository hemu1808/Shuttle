import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: String,
  date: Date,
  seats: Number,
  price: Number,
});


eventSchema.add({
  bookedSeats: {
    type: [Number],
    default: [],
  },
});

export default mongoose.model("Event", eventSchema);