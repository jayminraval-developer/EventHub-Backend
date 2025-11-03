import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
