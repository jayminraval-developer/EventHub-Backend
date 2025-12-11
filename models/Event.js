import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true }, // Simple string for now, can be object later
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  price: { type: Number, default: 0 },
  image: { type: String },
  availableSeats: { type: Number, default: 0 },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ["draft", "published", "cancelled", "completed"], default: "draft" },
  attendees: { type: Number, default: 0 }
}, { timestamps: true });

const Event = mongoose.model("Event", EventSchema);

export default Event;
