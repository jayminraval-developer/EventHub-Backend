    // controllers/eventController.js

    import Event from "../models/Event.js";

    // Create event
    export const createEvent = async (req, res) => {
    try {
        const { name, description, date, location, price, category, image, availableSeats } = req.body;
        if (!name || !date || !location)
        return res.status(400).json({ message: "Name, date, and location are required" });

        const newEvent = await Event.create({ name, description, date, location, price, category, image, availableSeats });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Get all events
    export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().limit(10);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Get single event
    export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Update event
    export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        Object.assign(event, req.body); // update only provided fields
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };

    // Delete event (optional)
    export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });

        await event.remove();
        res.json({ message: "Event removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };
