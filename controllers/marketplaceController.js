import Service from "../models/Service.js";

// @desc    Get all services
// @route   GET /api/v1/marketplace/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update a service (Admin only)
// @route   PUT /api/v1/marketplace/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      service.title = req.body.title || service.title;
      service.description = req.body.description || service.description;
      service.price = req.body.price || service.price;
      service.benefits = req.body.benefits || service.benefits;

      const updatedService = await service.save();
      res.json(updatedService);
    } else {
      res.status(404).json({ message: "Service not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
