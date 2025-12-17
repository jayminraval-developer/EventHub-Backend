import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      name: { type: String, required: true },
      email: { type: String },
      // Optional: Reference to User model if needed
      // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    services: [
      {
        serviceName: { type: String, required: true },
        unitPrice: { type: Number, required: true },
        qty: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PAID", "PENDING", "FAILED"],
      default: "PAID",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
