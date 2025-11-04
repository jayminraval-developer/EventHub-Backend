// controllers/userController.js
import UAParser from "ua-parser-js";
import geoip from "geoip-lite";  // npm i geoip-lite
import User from "../models/User.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    // 1️⃣  Parse user-agent
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    // 2️⃣  Get IP (handle reverse proxy or localhost)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    // 3️⃣  Get location
    const geo = geoip.lookup(ip);
    const location = geo
      ? `${geo.city || ""}, ${geo.country || ""}`
      : "Unknown";

    // 4️⃣  Prepare login info
    const loginData = {
      ip,
      device: result.device.model || "Desktop",
      os: result.os.name,
      browser: result.browser.name,
      location,
    };

    // 5️⃣  Save to DB
    user.loginHistory.push(loginData);
    await user.save();

    res.json({
      message: "Login successful",
      user,
      loginData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
