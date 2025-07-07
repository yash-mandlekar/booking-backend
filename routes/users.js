const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
      enum: ["admin", "owner", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
