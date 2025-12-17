import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const email = "jayminraval7046@gmail.com";
    const password = "J@ymin7046";
    const name = "Jaymin Raval";

    // Check if exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("Admin already exists. Updating password...");
      existing.password = password;
      existing.name = name;
      existing.permissions = ["finance_view", "settings_global"]; // Give permissions by default
      await existing.save();
      console.log("Admin updated successfully.");
    } else {
      const newAdmin = new Admin({
        name,
        email,
        password,
        role: "admin",
        permissions: ["finance_view", "settings_global"], // active all permissions
        avatar: "https://ui-avatars.com/api/?name=Jaymin+Raval&background=random"
      });
      await newAdmin.save();
      console.log("Admin created successfully.");
    }
    process.exit();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
