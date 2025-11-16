// controllers/userController.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import LoginActivity from "../models/LoginActivity.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* Helper: Get Client IP */
const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  const remote = req.socket?.remoteAddress || req.ip || "";
  return remote.replace("::ffff:", "");
};

/* =========================================================
   REGISTER USER
========================================================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================
   LOGIN USER (Single Device Login)
========================================================= */
export const loginUser = async (req, res) => {
  const { email, password, deviceToken } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";
  const parser = new UAParser(userAgent);
  const parsed = parser.getResult();

  let user = null;

  try {
    user = await User.findOne({ email });
    const baseLog = {
      userId: user?._id || null,
      email,
      ip,
      userAgent,
      parsedUA: parsed,
      deviceInfo: null,
    };

    if (!user || !(await user.matchPassword(password))) {
      await LoginActivity.create({ ...baseLog, success: false });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.deviceToken && deviceToken && user.deviceToken !== deviceToken) {
      await LoginActivity.create({ ...baseLog, success: false });
      return res.status(403).json({
        message:
          "You are already logged in on another device. Please logout first.",
      });
    }

    const newDeviceToken = crypto.randomBytes(32).toString("hex");
    user.deviceToken = newDeviceToken;
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
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LOGOUT USER
========================================================= */
export const logoutUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.deviceToken = null;
    await user.save();
    return res.json({ message: "Logged out successfully" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LOGOUT FROM ALL DEVICES
========================================================= */
export const logoutFromAllDevices = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.deviceToken = null;
    await user.save();

    return res.json({ message: "All devices logged out successfully" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET PROFILE (Protected)
========================================================= */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.json(user);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   UPDATE PROFILE (Protected + Avatar Upload)
========================================================= */
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let avatarUrl = user.avatar;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "eventhub/avatars",
      });
      avatarUrl = upload.secure_url;
      fs.unlinkSync(req.file.path); // remove local file
    }

    user.name = updates.name || user.name;
    user.bio = updates.bio ?? user.bio;
    user.phone = updates.phone ?? user.phone;
    user.location = updates.location ?? user.location;
    user.gender = updates.gender ?? user.gender;
    user.dob = updates.dob ?? user.dob;
    user.social = updates.social ? JSON.parse(updates.social) : user.social;
    user.avatar = avatarUrl;

    await user.save();
    return res.json({ message: "Profile updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Update failed", error: error.message });
  }
};
