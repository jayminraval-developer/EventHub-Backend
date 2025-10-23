import express from "express";
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from "../controllers/eventController.js";

const router = express.Router();

// GET all events / POST new event
router.route("/").get(getEvents).post(createEvent);

// GET, PUT, DELETE a single event by ID
router.route("/:id").get(getEventById).put(updateEvent).delete(deleteEvent);

export default router;
