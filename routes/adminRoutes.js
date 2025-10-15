import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Example protected route
router.get("/dashboard", protectAdmin, (req, res) => {
  res.json({ message: `Welcome ${req.admin.name}! This is your admin dashboard.` });
});

export default router;
    