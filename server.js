import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Setup CORS with allowed origin
const allowedOrigins = [
  "http://localhost:5173/", // dev
  "https://event-hub-frontend-rosy.vercel.app/", 
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // optional — only needed if you use cookies or sessions
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("EventHub Backend is running"));

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
