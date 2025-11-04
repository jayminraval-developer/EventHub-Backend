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
  // req.socket.remoteAddress returns format like ::ffff:127.0.0.1 sometimes
  const remote = req.socket?.remoteAddress || req.ip || "";
  // clean IPv6 mapped IPv4
  return remote.replace("::ffff:", "");
};

// @desc Register new user
// @route POST /api/user/register
export const registerUser = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login user (Single Device Login + IP/Device Tracking)
// @route POST /api/user/login
export const loginUser = async (req, res) => {
  const { email, password, deviceInfo: clientDeviceInfo } = req.body; // deviceInfo from frontend (optional)

  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  // parse server-side user-agent
  const parser = new UAParser(userAgent);
  const parsed = parser.getResult();

  let user = null;
  try {
    user = await User.findOne({ email });

    // Default log object (we will create a LoginActivity entry always)
    const baseLog = {
      userId: user?._id,
      email: email || null,
      ip,
      userAgent,
      parsedUA: parsed,
      deviceInfo: clientDeviceInfo || null,
    };

    if (user && (await user.matchPassword(password))) {
      // single-device logic (you previously used user.deviceToken)
      // If deviceToken stored is not equal to incoming client token (we used deviceInfo before),
      // but here we generate a new device token every successful login.
      // If you want strict single-device: compare user.deviceToken with clientDeviceInfo.token or similar.
      if (user.deviceToken && clientDeviceInfo && user.deviceToken !== clientDeviceInfo) {
        // log failed attempt
        await LoginActivity.create({ ...baseLog, success: false });
        return res.status(403).json({
          message: "You are already logged in on another device. Please log out first.",
        });
      }

      // generate and save new deviceToken (keeps your previous behavior)
      const newDeviceToken = crypto.randomBytes(32).toString("hex");
      user.deviceToken = newDeviceToken;

      // update lastLogin info on user (optional)
      user.lastLogin = {
        time: new Date(),
        ip,
        browser: parsed.browser?.name || "",
        os: parsed.os?.name || "",
        platform: parsed.platform?.type || parsed.platform?.vendor || parsed.platform,
        deviceInfo: clientDeviceInfo || null,
      };

      await user.save();

      // store login activity (success)
      await LoginActivity.create({
        ...baseLog,
        success: true,
      });

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        deviceToken: newDeviceToken,
      });
    } else {
      // Invalid credentials — log attempt (no sensitive data)
      await LoginActivity.create({ ...baseLog, success: false });
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    // log server error attempt as failed login
    try {
      await LoginActivity.create({
        userId: user?._id,
        email: email || null,
        ip,
        userAgent,
        parsedUA: parsed,
        deviceInfo: clientDeviceInfo || null,
        success: false,
      });
    } catch (e) {
      console.error("Failed to save login activity:", e);
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc Logout user
// @route POST /api/user/logout
export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.deviceToken = null;
      await user.save();
      res.json({ message: "Logged out successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc Logout user from all devices
// @route POST /api/user/logout-all
// @access Private (Protected)
export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Remove deviceToken to force logout from all devices
    user.deviceToken = null;
    await user.save();

    res.json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Logout All Devices Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
