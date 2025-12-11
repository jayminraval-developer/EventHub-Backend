import express from "express";
import multer from "multer";
import { createEvent, createAdminEvent, getEvents, getEventById, updateEvent, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Routes
router.route("/")
  .get(getEvents)
  .post(upload.single("image"), createEvent); // image field name from frontend

router.route("/:id")
  .get(getEventById)
  .put(upload.single("image"), updateEvent)
  .delete(deleteEvent);

export default router;
