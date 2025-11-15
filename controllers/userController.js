// controllers/userController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import LoginActivity from "../models/LoginActivity.js";

// helper to get client IP (works behind proxies)
const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  const remote = req.socket?.remoteAddress || req.ip || "";
  return remote.replace("::ffff:", "");
};

/* =========================================================
   REGISTER
========================================================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* =========================================================
   LOGIN — Single Device Login (Corrected)
========================================================= */
export const loginUser = async (req, res) => {
  const { email, password, deviceToken } = req.body; // FIXED: string only

  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  const parser = new UAParser(userAgent);
  const parsed = parser.getResult();

  let user = null;

  try {
    user = await User.findOne({ email });

    const baseLog = {
      userId: user?._id || null,
      email: email || "",
      ip,
      userAgent,
      parsedUA: parsed,
      deviceInfo: null,
    };

    // No user or wrong password
    if (!user || !(await user.matchPassword(password))) {
      await LoginActivity.create({ ...baseLog, success: false });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    /* -------------------------------
       FIXED: correct single-device logic
       deviceToken must match existing deviceToken
    --------------------------------*/
    if (user.deviceToken && deviceToken && user.deviceToken !== deviceToken) {
      await LoginActivity.create({ ...baseLog, success: false });
      return res.status(403).json({
        message:
          "You are already logged in on another device. Please log out first.",
      });
    }

    // Generate new device token for this login
    const newDeviceToken = crypto.randomBytes(32).toString("hex");
    user.deviceToken = newDeviceToken;

    // Store last login details
    user.lastLogin = {
      time: new Date(),
      ip,
      browser: parsed.browser?.name || "",
      os: parsed.os?.name || "",
      platform:
        parsed.platform?.type ||
        parsed.platform?.vendor ||
        parsed.platform ||
        "",
    };

    await user.save();

    await LoginActivity.create({ ...baseLog, success: true });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      deviceToken: newDeviceToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    await LoginActivity.create({
      userId: user?._id,
      email,
      ip,
      userAgent,
      parsedUA: parsed,
      deviceInfo: null,
      success: false,
    });
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LOGOUT (Single device)
========================================================= */
export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.deviceToken = null;
    await user.save();

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LOGOUT ALL DEVICES
========================================================= */
export const logoutFromAllDevices = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.deviceToken = null;
    await user.save();

    return res.json({ message: "All devices logged out successfully" });
  } catch (error) {
    console.error("Logout All Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
