import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) return res.status(401).json({ message: "Not authorized" });

      // Check device token for single-device login
      const deviceTokenHeader = req.headers["x-device-token"];
      if (!deviceTokenHeader || admin.deviceToken !== deviceTokenHeader) {
        return res.status(401).json({ message: "Logged out from previous device" });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protectAdmin };
