import express from "express";
import {
  getInvoices,
  generateInvoice,
  downloadInvoice,
} from "../controllers/billingController.js";

const router = express.Router();

router.route("/invoices").get(getInvoices);
router.route("/generate").post(generateInvoice);
router.route("/download/:id").get(downloadInvoice);

export default router;
