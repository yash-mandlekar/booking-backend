const User = require("../routes/users");

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, contact } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({
      name,
      email,
      password,
      role,
      contact,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check plain-text password
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    // Success – send user data
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
