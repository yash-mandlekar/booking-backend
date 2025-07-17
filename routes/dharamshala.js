const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid Indian phone number"],
    },
    event: {
      type: String,
    },
    email: {
      type: String,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
  },
  { _id: false } // Prevents creation of _id for subdocs
);

const dharamshalaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    images: [{ type: String }],
    location: { type: String, required: true },
    mapUrl: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    contact: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid Indian contact number"],
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    bookedDates: {
      type: [bookingSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("dharamshala", dharamshalaSchema);
