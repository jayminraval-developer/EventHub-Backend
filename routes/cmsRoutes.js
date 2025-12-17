import express from "express";
import { createCMS, getAllCMS, updateCMS, toggleStatus, deleteCMS } from "../controllers/cmsController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), createCMS);
router.get("/", getAllCMS);
router.put("/:id", upload.single("image"), updateCMS);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteCMS);

export default router;
