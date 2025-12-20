import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// ✅ Protect normal user routes
export const protectUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const deviceHeader = req.headers["x-device-token"];

  if (!authHeader || !deviceHeader) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.deviceToken !== deviceHeader) {
      return res.status(401).json({ message: "Logged out from previous device" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// ✅ Protect admin routes
export const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Admin not authorized, token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Check Admin Collection
    let account = await Admin.findById(decoded.id).select("-password");

    // 2. Check User Collection (e.g. for Organizers accessing Admin Panel)
    if (!account) {
      const user = await User.findById(decoded.id).select("-password");
      if (user && ["organizer", "staff"].includes(user.role)) {
        account = user;
        // Polyfill permissions for User if missing, to prevent frontend crashes
        if (!account.permissions) {
          account.permissions = []; 
        }
      }
    }

    if (!account) {
      return res.status(401).json({ message: "Not authorized as admin" });
    }

    req.admin = account;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
