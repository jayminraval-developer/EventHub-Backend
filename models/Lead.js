import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    salesManager: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "Prospect",
        "Interested",
        "Demo Booked",
        "Demo Completed",
        "Follow up",
        "Under Review",
        "Onboarded",
        "Not Interested",
      ],
      default: "Prospect",
    },
    type: { type: String, default: "Merchant" },
    source: { type: String, default: "" },
    sourceLink: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
