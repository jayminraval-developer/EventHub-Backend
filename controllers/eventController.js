// controllers/eventController.js
import Event from "../models/Event.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Public (you can secure later)
export const createEvent = async (req, res) => {
  try {
    const { name, description, date, location, price, category, image, availableSeats } = req.body;

    if (!name || !date || !location) {
      return res.status(400).json({ message: "Name, date, and location are required" });
    }

    const newEvent = await Event.create({
      name,
      description,
      date,
      location,
      price,
      category,
      image,
      availableSeats,
    });

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events (limit 10 for now)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().limit(10);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
