import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

// @desc Register new admin
// @route POST /api/admin/register
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login admin with single-device logic
// @route POST /api/admin/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      // Generate a unique device token for this session
      const deviceToken = crypto.randomBytes(16).toString("hex");

      // Save token in admin DB
      admin.deviceToken = deviceToken;
      await admin.save();

      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
        deviceToken, // send to frontend
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalEvents = await Event.countDocuments();
    const activeOrganizers = await User.countDocuments({ role: "organizer", "organizerProfile.verificationStatus": "verified" });
    
    // Calculate total revenue from confirmed bookings
    // Note: This matches the "fake" logic in mock data but real implementation would need aggregation
    const bookings = await Booking.find({ status: "confirmed" });
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalAmount, 0);

    // Get recent activity
    const recentBookings = await Booking.find().sort("-createdAt").limit(5)
      .populate("user", "name")
      .populate("event", "name");
      
    const recentActivity = recentBookings.map(b => ({
      id: b._id,
      user: b.user?.name || "Unknown",
      action: "booked ticket for",
      target: b.event?.name || "Unknown Event",
      time: b.createdAt
    }));

    // Mock revenue chart data for now as we don't have historical data
    const revenueChart = [
      { month: 'Jan', amount: 4000 },
      { month: 'Feb', amount: 3000 },
      { month: 'Mar', amount: 2000 },
      { month: 'Apr', amount: 2780 },
      { month: 'May', amount: 1890 },
      { month: 'June', amount: 2390 },
    ];

    res.json({
      totalUsers,
      totalEvents,
      totalRevenue,
      activeOrganizers,
      recentActivity,
      revenueChart
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all organizers with stats
// @route   GET /api/admin/organizers
export const getOrganizers = async (req, res) => {
    try {
        const organizers = await User.find({ role: "organizer" })
            .select("-password")
            .lean(); // Use lean for performance and easier modification
        
        const organizersWithStats = await Promise.all(organizers.map(async (org) => {
            const liveEvents = await Event.countDocuments({ organizer: org._id, status: "published" });
            const completedEvents = await Event.countDocuments({ organizer: org._id, status: "completed" });
            return {
                ...org,
                live: liveEvents,
                completed: completedEvents,
                salesManager: "Not Assigned" // Placeholder until Sales Manager concept exists
            };
        }));

        res.json(organizersWithStats);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/admin/events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("category", "name");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
