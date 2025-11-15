import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  logoutFromAllDevices, // ✅ exact same name as controller export
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/logout-all", logoutFromAllDevices); // ✅ correct route

export default router;
