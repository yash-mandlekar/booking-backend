const Dharamshala = require("../routes/dharamshala");
const User = require("../routes/users");

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalDharamshalas = await Dharamshala.countDocuments();

    const totalBookings = await Dharamshala.aggregate([
      { $unwind: "$bookedDates" },
      { $count: "totalBookings" },
    ]);

    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalSuperAdmins = await User.countDocuments({ role: "super admin" });

    res.status(200).json({
      totalDharamshalas,
      totalBookings: totalBookings[0]?.totalBookings || 0,
      totalAdmins,
      totalSuperAdmins,
    });
  } catch (err) {
    console.error("Error fetching dashboard summary:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    const users = await User.find(); // you might want to filter with { role: 'admin' }
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update admin by ID
exports.updateAdmin = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
