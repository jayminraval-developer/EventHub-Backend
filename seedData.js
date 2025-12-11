import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Event from "./models/Event.js";
import Booking from "./models/Booking.js";
import Category from "./models/Category.js";
import Admin from "./models/Admin.js";
import bcrypt from "bcryptjs";

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        console.log("🧹 Clearing Database...");
        await User.deleteMany({});
        await Event.deleteMany({});
        await Booking.deleteMany({});
        await Category.deleteMany({});
        await Admin.deleteMany({});

        console.log("🌱 Creating Categories...");
        const categories = await Category.insertMany([
            { name: "Music", description: "Concerts and festivals", icon: "music_note" },
            { name: "Technology", description: "Tech conferences and hackathons", icon: "computer" },
            { name: "Business", description: "Networking and seminars", icon: "business_center" },
            { name: "Health", description: "Yoga and health workshops", icon: "fitness_center" },
            { name: "Arts", description: "Art exhibitions and theater", icon: "palette" },
        ]);

        console.log("👤 Creating Users & Organizers...");
        const hashedPassword = await bcrypt.hash("123456", 10);
        
        // Organizers
        const organizer1 = await User.create({
            name: "TechWorld Inc.",
            email: "org1@example.com",
            password: hashedPassword,
            role: "organizer",
            organizerProfile: {
                companyName: "TechWorld Inc.",
                website: "https://techworld.com",
                verificationStatus: "verified",
                taxId: "TX123456"
            }
        });

        const organizer2 = await User.create({
            name: "Music Fest LLC",
            email: "org2@example.com",
            password: hashedPassword,
            role: "organizer",
            organizerProfile: {
                companyName: "Music Fest LLC",
                verificationStatus: "verified",
            }
        });

        // Users
        const user1 = await User.create({ name: "John Doe", email: "john@example.com", password: hashedPassword });
        const user2 = await User.create({ name: "Alice Smith", email: "alice@example.com", password: hashedPassword });
        const user3 = await User.create({ name: "Bob Jones", email: "bob@example.com", password: hashedPassword });

        console.log("📅 Creating Events...");
        const events = await Event.insertMany([
            {
                name: "Future Tech Summit 2025",
                description: "The biggest tech conference of the year.",
                date: new Date("2025-05-15"),
                location: "San Francisco, CA",
                organizer: organizer1._id,
                category: categories[1]._id, // Tech
                price: 299,
                capacity: 500,
                availableSeats: 480,
                status: "published",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
                attendees: 20
            },
            {
                name: "Summer Vibes Festival",
                description: "Music, food, and fun.",
                date: new Date("2025-07-20"),
                location: "Austin, TX",
                organizer: organizer2._id,
                category: categories[0]._id, // Music
                price: 150,
                capacity: 2000,
                availableSeats: 1950,
                status: "published",
                image: "https://images.unsplash.com/photo-1459749411177-0473ef716175?auto=format&fit=crop&q=80&w=800",
                attendees: 50
            },
            {
                name: "Startup Pitch Night",
                description: "Local startups pitching to investors.",
                date: new Date("2025-06-10"),
                location: "New York, NY",
                organizer: organizer1._id,
                category: categories[2]._id, // Business
                price: 0,
                capacity: 100,
                availableSeats: 90,
                status: "published",
                image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800",
                attendees: 10
            }
        ]);

        console.log("🎫 Creating Bookings...");
        await Booking.create({
            user: user1._id,
            event: events[0]._id,
            tickets: [{ type: "General", quantity: 1, price: 299 }],
            totalAmount: 299,
            status: "confirmed"
        });

        await Booking.create({
            user: user2._id,
            event: events[0]._id,
            tickets: [{ type: "General", quantity: 2, price: 299 }],
            totalAmount: 598,
            status: "confirmed"
        });
        
        await Booking.create({
            user: user3._id,
            event: events[1]._id,
            tickets: [{ type: "VIP", quantity: 1, price: 150 }],
            totalAmount: 150,
            status: "confirmed"
        });

        console.log("🛡️ Creating Admin...");
        await Admin.create({
            name: "Super Admin",
            email: "admin@eventhub.com",
            password: "adminpassword", // Will be hashed by pre-save hook
            role: "admin"
        });

        console.log("✅ Data Seeding Completed!");
        process.exit();

    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
