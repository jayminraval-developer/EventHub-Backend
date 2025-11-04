// models/LoginActivity.js
import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  email: { type: String, required: false }, // store email for failed attempts where userId may not exist
  ip: String,
  userAgent: String,
  parsedUA: Object,      // structured ua-parser result
  deviceInfo: Object,    // deviceInfo sent from frontend (navigator data)
  geo: Object,           // optional: IP -> geo lookup later
  success: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
export default LoginActivity;
