import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} from "../controllers/leadController.js";


const router = express.Router();

// Apply auth middleware if you have it implemented, otherwise standard routes for now
// Assuming protect and admin middlewares exist based on file structure
router.route("/").post(createLead).get(getLeads);
router.route("/:id").put(updateLead).delete(deleteLead);

export default router;
