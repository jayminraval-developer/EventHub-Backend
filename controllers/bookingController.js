import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { eventId, tickets, totalAmount, paymentId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableSeats < tickets.reduce((acc, t) => acc + t.quantity, 0)) {
        return res.status(400).json({ message: "Not enough seats available" });
    }

    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      tickets,
      totalAmount,
      paymentId,
      status: "confirmed", // Auto confirm for now, later integrate payment webhook
    });

    await booking.save();

    // Update event seats and attendees
    const totalTickets = tickets.reduce((acc, t) => acc + t.quantity, 0);
    event.availableSeats -= totalTickets;
    event.attendees += totalTickets;
    await event.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "name date location image")
      .sort("-createdAt");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all bookings (Admin/Organizer)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate("user", "name email")
            .populate("event", "name date")
            .sort("-createdAt");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
