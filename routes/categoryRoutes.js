import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { protectUser as protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, protectAdmin, createCategory).get(getCategories);

export default router;
