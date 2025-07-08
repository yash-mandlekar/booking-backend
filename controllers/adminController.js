const User = require("../routes/users");

// Me
exports.getAdmins = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
