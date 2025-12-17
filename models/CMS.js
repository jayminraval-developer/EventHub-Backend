import mongoose from "mongoose";

const cmsSchema = new mongoose.Schema(
  {
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    category: { type: String, default: "" },
    slug: { type: String, required: true, unique: true },
    seoTitle: { type: String, required: true },
    seoDescription: { type: String, default: "" },
    keywords: { type: String, default: "" },
    image: { type: String, default: "" }, // Path to uploaded image
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("CMS", cmsSchema);
