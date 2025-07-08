const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      match: [/^\+91-\d{10}$/, "Please enter a valid Indian contact number"],
    },
    role: {
      type: String,
      enum: ["admin", "super_admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
