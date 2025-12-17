import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // User Name or "System", "Guest"
    role: { type: String, default: "User" }, // Admin, Organizer, User
    action: { type: String, required: true }, // CREATED, UPDATED, DELETED, LOGIN, LOGOUT, etc.
    module: { type: String, required: true }, // EVENT, CMS, USER, BILLING, CRM, AUTH
    target: { type: String, default: "" }, // Entity Name or ID relevant to action
    details: { type: Object, default: {} }, // Extra info if needed
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("SystemLog", systemLogSchema);
