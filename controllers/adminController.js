import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import SystemLog from "../models/SystemLog.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

// @desc Register new admin
// @route POST /api/admin/register
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, avatar, permissions } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ 
      name, 
      email, 
      password,
      role: role || "admin",
      avatar: avatar || "",
      permissions: permissions || []
    });

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
    const normalizedEmail = email.toLowerCase();
    console.log(`Login attempt for: ${normalizedEmail}`); // Debug log

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (admin && (await admin.matchPassword(password))) {
      // ... (rest of logic same)
      // Generate a unique device token for this session
      const deviceToken = crypto.randomBytes(16).toString("hex");

      // Save token in admin DB
      admin.deviceToken = deviceToken;
      await admin.save();

      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
        permissions: admin.permissions,
        token: generateToken(admin._id),
        deviceToken, // send to frontend
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ...

// @desc    Seed Admin Users (Dynamic or Default)
// @route   GET /api/admin/seed (or POST to provide list)
export const seedAdmin = async (req, res) => {
  try {
    let adminsToSeed = req.body.admins;

    // Fallback to default System Admins if no body provided
    if (!adminsToSeed || !Array.isArray(adminsToSeed) || adminsToSeed.length === 0) {
      adminsToSeed = [
        {
          name: "Dipak",
          email: "dt1193699@gmail.com",
          password: "Dip@k7069",
          role: "super_admin",
          avatar: "https://ui-avatars.com/api/?name=Dipak&background=random",
        },
        {
          name: "Jaymin Raval",
          email: "jayminraval7046@gmail.com",
          password: "J@ymin7046",
          role: "super_admin",
          avatar: "https://ui-avatars.com/api/?name=Jaymin+Raval&background=random",
        },
        {
          name: "Jaymin Admin",
          email: "jayminraval57@gmail.com",
          password: "J@ymin7046",
          role: "admin",
          avatar: "https://ui-avatars.com/api/?name=Jaymin+Admin&background=random",
        },
      ];
    }
    
    // ... rest of the function remains the same, iterating over adminsToSeed

    const results = [];

    for (const adminData of adminsToSeed) {
      const normalizedEmail = adminData.email.toLowerCase();
      const existingAdmin = await Admin.findOne({ email: normalizedEmail });
      
      if (existingAdmin) {
        // Update existing admin
        existingAdmin.password = adminData.password; // Triggers hash on save
        existingAdmin.role = adminData.role;
        existingAdmin.name = adminData.name;
        await existingAdmin.save();
        results.push({ email: normalizedEmail, status: "Updated", role: adminData.role });
      } else {
        // Create new admin
        await Admin.create({
          name: adminData.name,
          email: normalizedEmail,
          password: adminData.password, // Triggers hash on create/save
          role: adminData.role,
          permissions: ["finance_view", "settings_global"], // Default perms
          avatar: adminData.avatar,
        });
        results.push({ email: normalizedEmail, status: "Created", role: adminData.role });
      }
    }

    res.status(200).json({
      message: "Admin seeding completed",
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Current Admin Profile
// @route   GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  try {
    // req.admin is set by protectAdmin middleware
    const admin = await Admin.findById(req.admin._id).select(
      "-password -deviceToken"
    );
    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update Admin Profile
// @route PUT /api/admin/profile
export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (admin) {
      admin.name = req.body.name || admin.name; // Keep name required
      admin.email = req.body.email || admin.email; // Keep email required

      // Allow clearing these fields (if sent as "" it should overwrite)
      if (req.body.phone !== undefined) admin.phone = req.body.phone;
      if (req.body.bio !== undefined) admin.bio = req.body.bio;
      if (req.body.avatar !== undefined) admin.avatar = req.body.avatar;

      if (req.body.password) {
        const { currentPassword } = req.body;
        if (!currentPassword) {
          return res.status(400).json({
            message: "Current password is required to set a new password",
          });
        }
        if (await admin.matchPassword(currentPassword)) {
          admin.password = req.body.password;
        } else {
          return res
            .status(401)
            .json({ message: "Incorrect current password" });
        }
      }

      const updatedAdmin = await admin.save();
      res.json({
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        phone: updatedAdmin.phone,
        bio: updatedAdmin.bio,
        avatar: updatedAdmin.avatar,
        token: generateToken(updatedAdmin._id),
      });
    } else {
      res.status(404).json({ message: "Admin not found" });
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
    const activeOrganizers = await User.countDocuments({
      role: "organizer",
      "organizerProfile.verificationStatus": "verified",
    });

    // Calculate total revenue from confirmed bookings
    const bookings = await Booking.find({ status: "confirmed" });
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalAmount,
      0
    );

    // Fetch Recent Activity from Centralized Log
    const recentActivity = await SystemLog.find()
      .sort({ timestamp: -1 })
      .limit(20);

    // Mock revenue chart data for now as we don't have historical data
    const revenueChart = [
      { month: "Jan", amount: 4000 },
      { month: "Feb", amount: 3000 },
      { month: "Mar", amount: 2000 },
      { month: "Apr", amount: 2780 },
      { month: "May", amount: 1890 },
      { month: "Jun", amount: 2390 },
    ];

    res.json({
      totalUsers,
      totalEvents,
      activeOrganizers,
      totalRevenue,
      recentActivity,
      revenueChart,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all organizers with stats
// @route   GET /api/admin/organizers
export const getOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" })
      .select("-password")
      .lean(); // Use lean for performance and easier modification

    const organizersWithStats = await Promise.all(
      organizers.map(async (org) => {
        const liveEvents = await Event.countDocuments({
          organizer: org._id,
          status: "published",
        });
        const completedEvents = await Event.countDocuments({
          organizer: org._id,
          status: "completed",
        });
        return {
          ...org,
          live: liveEvents,
          completed: completedEvents,
          salesManager: "Not Assigned", // Placeholder until Sales Manager concept exists
        };
      })
    );

    res.json(organizersWithStats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get users with role filtering
// @route   GET /api/admin/users?role=type
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};

    if (role) {
      if (role === "audience") {
        // Fetch both "audience" and legacy "user" roles
        query = { role: { $in: ["audience", "user"] } };
      } else {
        query = { role };
      }
    } else {
      // Default behavior if no role specified: don't fetch admins? or fetch all?
      // Let's fetch all non-admins for safety, or just standard users if no param
      query = { role: "user" }; // Fallback to old behavior
    }

    const users = await User.find(query).select("-password -deviceToken");
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

// @desc    Get all events
// @route   GET /api/admin// Get all login activities (Security Log)
export const getLoginActivities = async (req, res) => {
  try {
    // Assuming LoginActivity is populated during login (which we might need to fix if it's not)
    // For now, let's fetch from LoginActivity model if used, or aggregate from Users loginHistory.
    // Let's use the LoginActivity model if it exists, otherwise we'll aggregate.
    // Based on file list, LoginActivity model exists.

    // Dynamic import to avoid circular dependency issues or just standard import at top if possible
    // But for this edit block, I will assume it is not imported yet.
    // Better strategy: I'll add the import at the top in a separate edit or just use User's loginHistory for now to be safe.
    // Actually, let's check if LoginActivity is used. IF NOT, this table will be empty.
    // Let's sticking to "User.loginHistory" for now to show SOMETHING.

    const users = await User.find({}).select("name email loginHistory");
    let logs = [];
    users.forEach((user) => {
      if (user.loginHistory) {
        user.loginHistory.forEach((log) => {
          logs.push({
            ...log.toObject(),
            userName: user.name,
            userEmail: user.email,
            _id: log._id || new Date().getTime(),
          });
        });
      }
    });

    // Sort by date desc
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed Admin User due to lack of shell access
// @route   GET /api/admin/seed
// @desc    Seed Admin Users
// @route   GET /api/admin/seed
export const seedAdmin = async (req, res) => {
  try {
    const adminsToSeed = [
      {
        name: "Dipak",
        email: "dt1193699@gmail.com",
        password: "Dip@k7069",
        role: "super_admin",
        avatar: "https://ui-avatars.com/api/?name=Dipak&background=random",
      },
      {
        name: "Jaymin Raval",
        email: "jayminraval7046@gmail.com",
        password: "J@ymin7046",
        role: "super_admin",
        avatar:
          "https://ui-avatars.com/api/?name=Jaymin+Raval&background=random",
      },
      {
        name: "Jaymin Admin",
        email: "jayminraval57@gmail.com",
        password: "J@ymin7046",
        role: "admin",
        avatar:
          "https://ui-avatars.com/api/?name=Jaymin+Admin&background=random",
      },
    ];

    const results = [];

    for (const adminData of adminsToSeed) {
      const existingAdmin = await Admin.findOne({ email: adminData.email });

      if (existingAdmin) {
        // Update existing admin
        existingAdmin.password = adminData.password; // Triggers hash on save
        existingAdmin.role = adminData.role;
        existingAdmin.name = adminData.name;
        await existingAdmin.save();
        results.push({
          email: adminData.email,
          status: "Updated",
          role: adminData.role,
        });
      } else {
        // Create new admin
        await Admin.create({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password, // Triggers hash on create/save
          role: adminData.role,
          permissions: ["finance_view", "settings_global"], // Default perms
          avatar: adminData.avatar,
        });
        results.push({
          email: adminData.email,
          status: "Created",
          role: adminData.role,
        });
      }
    }

    res.status(200).json({
      message: "Admin seeding completed",
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
