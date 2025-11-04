// models/LoginActivity.js
import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: String,
    ip: String,
    userAgent: String,
    parsedUA: Object,
    deviceInfo: Object,
    success: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);
export default LoginActivity;
