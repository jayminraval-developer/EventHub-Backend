import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().limit(10); // fetch 10 events
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new event
router.post("/", async (req, res) => {
  const { name, description, date, location, price, category, image, availableSeats } = req.body;

  try {
    const newEvent = new Event({
      name,
      description,
      date,
      location,
      price,
      category,
      image,
      availableSeats,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
