// routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  logoutFromAllDevices,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js"; // required for test route

const router = express.Router();

/* ======================
   AUTH ROUTES
====================== */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/logout-all", logoutFromAllDevices);

/* ======================
   PROFILE ROUTES
====================== */
router.get("/profile", protectUser, getProfile);

router.put(
  "/profile",
  protectUser,
  upload.single("avatar"), // Expect field name "avatar"
  updateProfile
);

/* ======================
   CLOUDINARY TEST (optional)
====================== */
router.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "eventhub/test" }
    );
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
