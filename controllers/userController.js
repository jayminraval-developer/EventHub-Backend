import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";

// @desc Register new user
// @route POST /api/user/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc Login user (Single Device Login)
// @route POST /api/user/login
export const loginUser = async (req, res) => {
  const { email, password, deviceInfo } = req.body; // deviceInfo from frontend (browser info)

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if already logged in from another device
    if (user.deviceToken && user.deviceToken !== deviceInfo) {
      return res.status(403).json({
        message: "You are already logged in on another device. Please log out first.",
      });
    }

    // Generate a new device token
    const newDeviceToken = crypto.randomBytes(32).toString("hex");
    user.deviceToken = newDeviceToken;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      deviceToken: newDeviceToken,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc Logout user
// @route POST /api/user/logout
export const logoutUser = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (user) {
    user.deviceToken = null;
    await user.save();
    res.json({ message: "Logged out successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
