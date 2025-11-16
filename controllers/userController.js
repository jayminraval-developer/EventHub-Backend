import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/* =========================================================
   GET USER PROFILE
========================================================= */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -deviceToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* =========================================================
   UPDATE USER PROFILE
========================================================= */
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    let avatarUrl = null;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "eventhub/avatars",
      });
      avatarUrl = upload.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...updates,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      { new: true }
    ).select("-password -deviceToken");

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};
