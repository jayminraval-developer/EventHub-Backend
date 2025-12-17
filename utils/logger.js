import SystemLog from "../models/SystemLog.js";

/**
 * Logs a system activity to the database.
 * @param {Object} req - Express request object (to extract user info)
 * @param {String} action - Action performed (e.g., "CREATED", "UPDATED")
 * @param {String} module - System module (e.g., "CMS", "EVENT")
 * @param {String} target - Target entity name or description
 * @param {Object} details - Optional extra details
 */
export const logActivity = async (req, action, module, target, details = {}) => {
  try {
    const user = req.user ? req.user.name : (req.admin ? req.admin.name : "Guest/System");
    const role = req.user ? req.user.role : (req.admin ? "Admin" : "System");

    await SystemLog.create({
      user,
      role,
      action,
      module,
      target,
      details,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Silent fail to not disrupt main flow
  }
};
