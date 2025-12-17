import Lead from "../models/Lead.js";
import { logActivity } from "../utils/logger.js";

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private/Admin
export const createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    
    // Log Activity
    await logActivity(req, "CREATED", "CRM", lead.companyName || lead.ownerName, { id: lead._id });

    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private/Admin
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private/Admin
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      lead.companyName = req.body.companyName || lead.companyName;
      lead.ownerName = req.body.ownerName || lead.ownerName;
      lead.email = req.body.email || lead.email;
      lead.mobile = req.body.mobile || lead.mobile;
      lead.country = req.body.country || lead.country;
      lead.state = req.body.state || lead.state;
      lead.city = req.body.city || lead.city;
      lead.salesManager = req.body.salesManager || lead.salesManager;
      lead.status = req.body.status || lead.status;
      lead.type = req.body.type || lead.type;
      lead.source = req.body.source || lead.source;
      lead.sourceLink = req.body.sourceLink || lead.sourceLink;
      
      const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      // Log Activity
      await logActivity(req, "UPDATED", "CRM", updatedLead.companyName || updatedLead.ownerName, { id: updatedLead._id });

      res.json(updatedLead);
    } else {
      res.status(404).json({ message: "Lead not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      await Lead.deleteOne({ _id: lead._id });
      res.json({ message: "Lead removed" });
    } else {
      res.status(404).json({ message: "Lead not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
