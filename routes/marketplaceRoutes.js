import express from "express";
import {
  getServices,
  updateService,
} from "../controllers/marketplaceController.js";

const router = express.Router();

router.route("/services").get(getServices);
router.route("/services/:id").put(updateService);

export default router;
