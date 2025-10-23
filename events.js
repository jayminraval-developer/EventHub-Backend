import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  price: { type: Number, default: 0 },
  category: { type: String },
  image: { type: String },
  availableSeats: { type: Number, default: 0 },
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
