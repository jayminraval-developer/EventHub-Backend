import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  logoutFromAllDevices,
  getProfile,
  updateProfile,
  getAllUsers,
} from "../controllers/userController.js";
import { protectUser, protectAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary local storage before Cloudinary

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protectUser, logoutUser);
router.post("/logout-all", protectUser, logoutFromAllDevices);
router.get("/profile", protectUser, getProfile);
router.put("/profile", protectUser, upload.single("avatar"), updateProfile);
router.get("/", protectAdmin, getAllUsers); // Protected by admin middleware

export default router;