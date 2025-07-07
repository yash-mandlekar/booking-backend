const mongoose = require("mongoose");

const dharamshalaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      match: [/^\+91-\d{10}$/, "Please enter a valid Indian contact number"],
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    bookedDates: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("dharamshala", dharamshalaSchema);
