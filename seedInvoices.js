import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Invoice from "./models/Invoice.js";

dotenv.config();

const users = [
  "Prashant Solanki", "Ayush Kashyap", "Deepak Ashokkumar Agrawal", "Jagdish Purohit",
  "Dharak Kumar V Jani", "Arthrajsinh Solanki", "Seshu Kumar Polepeddi", "Krunal B Dave",
  "Rohan Patel", "Sneha Gupta", "Amit Sharma", "Priya Singh", "Vikram Malhotra",
  "Anjali Desai", "Rahul Verma", "Neha Kapoor", "Suresh Raina", "Manish Pandey"
];

const serviceNames = [
  "DIGI Mepass", "Event Host", "Onboarding", "WhatsApp Mepass", "Printed Mepass"
];

const generateInvoices = (count) => {
  const invoices = [];
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const serviceName = serviceNames[Math.floor(Math.random() * serviceNames.length)];
    const qty = Math.floor(Math.random() * 500) + 50;
    const unitPrice = Math.floor(Math.random() * 10) + 1;
    const amount = qty * unitPrice;
    
    invoices.push({
      invoiceId: `MES2526${Math.floor(100000 + Math.random() * 900000)}`,
      user: { name: user },
      services: [
        {
          serviceName: serviceName,
          unitPrice: unitPrice,
          qty: qty,
          amount: amount
        }
      ],
      discount: 0,
      gst: Math.floor(amount * 0.18),
      totalAmount: Math.floor(amount * 1.18),
      status: "PAID",
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random date in past
    });
  }
  return invoices;
};

const seedInvoices = async () => {
    try {
        await connectDB();
        
        // Optionally clear existing invoices if you want a fresh start
        // await Invoice.deleteMany(); 
        
        const invoices = generateInvoices(60); // Generate 60 records
        await Invoice.insertMany(invoices);
        
        console.log(`Successfully seeded ${invoices.length} invoices!`);
        process.exit();
    } catch (error) {
        console.error("Error seeding invoices:", error);
        process.exit(1);
    }
}

seedInvoices();
