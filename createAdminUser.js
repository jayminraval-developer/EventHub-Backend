import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const email = "jayminraval7046@gmail.com";
    const password = "J@ymin7046";
    const name = "Jaymin Raval";

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit();
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log("Admin created successfully:", admin.email);
    process.exit();
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
