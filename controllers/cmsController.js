import CMS from "../models/CMS.js";
import { logActivity } from "../utils/logger.js";

// Create new CMS entry
export const createCMS = async (req, res) => {
  try {
    const { state, city, category, slug, seoTitle, seoDescription, keywords } = req.body;
    
    // Check if slug already exists
    const existingCMS = await CMS.findOne({ slug });
    if (existingCMS) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    const image = req.file ? req.file.path.replace(/\\/g, "/") : ""; // Normalize path for Windows

    const newCMS = new CMS({
      state,
      city,
      category,
      slug,
      seoTitle,
      seoDescription,
      keywords,
      image,
    });

    await newCMS.save();
    
    // Log Activity
    await logActivity(req, "CREATED", "CMS", newCMS.slug, { id: newCMS._id, city: newCMS.city });

    res.status(201).json({ message: "CMS Page created successfully", cms: newCMS });
  } catch (error) {
    console.error("Error creating CMS:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all CMS entries
export const getAllCMS = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { slug: { $regex: search, $options: "i" } },
        { seoTitle: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      if (status === "active") query.isActive = true;
      if (status === "inactive") query.isActive = false;
    }

    const cmsList = await CMS.find(query).sort({ updatedAt: -1 });
    res.status(200).json(cmsList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update CMS entry
export const updateCMS = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.image = req.file.path.replace(/\\/g, "/");
    }

    const updatedCMS = await CMS.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCMS) {
      return res.status(404).json({ message: "CMS Page not found" });
    }

    // Log Activity
    await logActivity(req, "UPDATED", "CMS", updatedCMS.slug || "CMS Page", { id: updatedCMS._id });

    res.status(200).json({ message: "CMS Page updated successfully", cms: updatedCMS });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle Active Status
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const cms = await CMS.findById(id);

    if (!cms) {
      return res.status(404).json({ message: "CMS Page not found" });
    }

    cms.isActive = !cms.isActive;
    await cms.save();

    // Log Activity
    await logActivity(req, "UPDATED_STATUS", "CMS", cms.slug, { isActive: cms.isActive });

    res.status(200).json({ message: "Status updated", isActive: cms.isActive });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete CMS entry
export const deleteCMS = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCMS = await CMS.findByIdAndDelete(id);

    if (!deletedCMS) {
      return res.status(404).json({ message: "CMS Page not found" });
    }

    // Log Activity
    await logActivity(req, "DELETED", "CMS", deletedCMS.slug || "CMS Page");

    res.status(200).json({ message: "CMS Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
