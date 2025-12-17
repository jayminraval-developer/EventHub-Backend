import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        enum: ["fixed", "variable", "percentage"],
        default: "fixed",
      },
      unit: {
        type: String, // e.g., "Per Unit", "%"
        default: "",
      },
    },
    benefits: [
      {
        type: String,
      },
    ],
    icon: {
      type: String, // URL or className
      default: "bi-box-seam",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
