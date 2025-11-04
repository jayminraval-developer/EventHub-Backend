import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  logoutAllDevices,
} from "../controllers/userController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// ✅ Add this
router.post("/logout-all", protectUser, logoutAllDevices);

export default router;
