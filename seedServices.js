import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Service from "./models/Service.js";

dotenv.config();

const services = [
  {
    title: "Event Host",
    price: { amount: 1000, type: "fixed" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "Onboarding",
    price: { amount: 5000, type: "fixed" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "WhatsApp Mepass",
    price: { amount: 4, type: "variable", unit: "Per Unit" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "Digital Text Mepass",
    price: { amount: 2, type: "variable", unit: "Per Unit" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "Printed Mepass",
    price: { amount: 1, type: "variable", unit: "Per Unit" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "Convenience Charge",
    price: { amount: 5, type: "percentage", unit: "%" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "Merchant Convenience Charge",
    price: { amount: 8, type: "percentage", unit: "%" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
  {
    title: "DIGI Mepass",
    price: { amount: 5, type: "variable", unit: "Per Unit" },
    benefits: ["Text Mepass", "QR Security", "Unlimited Seller Users", "Unlimited scanning Users"],
  },
];

const seedServices = async () => {
    try {
        await connectDB();
        await Service.deleteMany(); // Clear existing
        await Service.insertMany(services);
        console.log("Services seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding services:", error);
        process.exit(1);
    }
}

seedServices();
