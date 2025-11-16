import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Profile fields
    avatar: { type: String, default: "" }, // Cloudinary URL
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    dateOfBirth: { type: Date, default: null },

    // Social Links
    social: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // Login system fields
    role: { type: String, default: "user" },
    deviceToken: { type: String, default: null },
    lastLogin: {
      time: Date,
      ip: String,
      browser: String,
      os: String,
      platform: String,
      deviceInfo: Object,
    },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
