import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import LoginActivity from "../models/LoginActivity.js"; // ✅ import new model

// Helper to extract client IP
const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip;
};

// @desc Login user (Single Device Login + IP/Device Tracking)
export const loginUser = async (req, res) => {
  const { email, password, deviceInfo } = req.body; // deviceInfo from frontend

  const user = await User.findOne({ email });
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "";

  try {
    if (user && (await user.matchPassword(password))) {
      // Check if already logged in from another device
      if (user.deviceToken && user.deviceToken !== deviceInfo) {
        await LoginActivity.create({
          userId: user._id,
          ip,
          userAgent,
          deviceInfo,
          success: false,
        });
        return res.status(403).json({
          message:
            "You are already logged in on another device. Please log out first.",
        });
      }

      // Generate a new device token
      const newDeviceToken = crypto.randomBytes(32).toString("hex");
      user.deviceToken = newDeviceToken;
      await user.save();

      // ✅ Save login activity
      await LoginActivity.create({
        userId: user._id,
        ip,
        userAgent,
        deviceInfo,
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
      // Log failed attempt
      await LoginActivity.create({
        userId: user?._id,
        ip,
        userAgent,
        deviceInfo,
        success: false,
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
