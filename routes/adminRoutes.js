import express from "express";
import { registerAdmin, loginAdmin, getDashboardStats, getOrganizers, getAllUsers, getAllEvents, getLoginActivities, getAdminProfile, updateAdminProfile } from "../controllers/adminController.js";
import { createAdminEvent } from "../controllers/eventController.js"; 
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.post("/login", loginAdmin);
router.route("/profile")
    .get(protectAdmin, getAdminProfile)
    .put(protectAdmin, updateAdminProfile);

router.get("/dashboard", protectAdmin, (req, res) => {
  res.json({ message: `Welcome Admin ${req.admin.name}` });
});
router.get("/stats", protectAdmin, getDashboardStats);
// stats route
router.get("/organizers", protectAdmin, getOrganizers);
router.get("/users", protectAdmin, getAllUsers);
router.route("/events")
  .get(protectAdmin, getAllEvents)
  .post(protectAdmin, createAdminEvent);

router.get("/security/logs", protectAdmin, getLoginActivities);

export default router;
