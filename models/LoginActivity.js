import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ip: String,
  userAgent: String,
  deviceInfo: Object,  // data from frontend (navigator)
  geo: Object,         // optional: fill later via IP API
  success: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
export default LoginActivity;
