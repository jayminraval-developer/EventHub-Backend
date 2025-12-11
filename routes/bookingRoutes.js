import express from "express";
import { createBooking, getMyBookings, getAllBookings } from "../controllers/bookingController.js";
import { protectUser as protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createBooking).get(protectAdmin, getAllBookings);
router.route("/mybookings").get(protect, getMyBookings);

export default router;
