import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("EventHub Backend is running ✅"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/v1/marketplace", marketplaceRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/cms", cmsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
