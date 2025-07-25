const User = require("../routes/users");

// Me
exports.me = async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await User.findOne({ _id: _id });
    if (!user) return res.status(400).json({ message: "User does not exists" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
    const { contact, password } = req.body;

    // Find user by contact

    const user = await User.findOne({ contact });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check plain-text password
    if (user.password !== password)
      return res.status(401).json({ message: "Invalid credentials" });

    // Success – send user data
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
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
