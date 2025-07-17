const Venue = require("../routes/dharamshala");
const userModel = require("../routes/users");

// Create a venue (owner or admin)
exports.createVenue = async (req, res) => {
  try {
    const venue = new Venue(req.body);
    await venue.save();
    res.status(201).json(venue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update venues
exports.updateVenue = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Venue ID (_id) is required." });
    }

    const updatedVenue = await Venue.findByIdAndUpdate(_id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    });

    if (!updatedVenue) {
      return res.status(404).json({ message: "Venue not found." });
    }

    res.status(200).json({
      message: "Venue updated successfully",
      venue: updatedVenue,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all venues
exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find().populate("owner");
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get venues
exports.getVenues = async (req, res) => {
  try {
    const user = await userModel.findById(req.query.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let venues;

    if (user.role === "super admin") {
      venues = await Venue.find();
    } else {
      // Return venues owned by this admin
      venues = await Venue.find({ owner: user._id });
    }

    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Delete venues
exports.deleteVenue = async (req, res) => {
  try {
    await Venue.deleteOne({ _id: req.params.id });

    res.json({ message: "Deleted Venue Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single venue
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate("owner");
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Book a date
exports.bookDate = async (req, res) => {
  try {
    const { bookings } = req.body;

    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return res.status(400).json({ message: "Bookings array is required" });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const bookedDatesSet = new Set(
      venue.bookedDates.map((b) => new Date(b.date).toISOString().split("T")[0])
    );

    const datesToBookSet = new Set();
    const validBookings = [];

    for (const booking of bookings) {
      const { date, name, phone, event, email } = booking;

      if (!date || !name || !phone) {
        return res
          .status(400)
          .json({ message: "Each booking must include date, name, and phone" });
      }

      const dateStr = new Date(date).toISOString().split("T")[0];

      if (bookedDatesSet.has(dateStr)) {
        return res
          .status(400)
          .json({ message: `Date ${dateStr} is already booked` });
      }

      if (datesToBookSet.has(dateStr)) {
        return res
          .status(400)
          .json({ message: `Duplicate date ${dateStr} found in request` });
      }

      datesToBookSet.add(dateStr);
      validBookings.push({ date, name, phone, event, email });
    }

    // Push all valid bookings
    venue.bookedDates.push(...validBookings);

    // Remove those dates from availableDates
    venue.availableDates = venue.availableDates.filter(
      (d) => !datesToBookSet.has(new Date(d).toISOString().split("T")[0])
    );

    await venue.save();

    res.status(200).json({
      message: "Bookings successful",
      booked: validBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeBookDate = async (req, res) => {
  try {
    const { dates } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of dates to remove." });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    const dateSetToRemove = new Set(
      dates.map((d) => new Date(d).toISOString().split("T")[0])
    );

    const originalLength = venue.bookedDates.length;

    // Filter out the bookings that should be removed
    venue.bookedDates = venue.bookedDates.filter(
      (booking) =>
        !dateSetToRemove.has(new Date(booking.date).toISOString().split("T")[0])
    );

    // Optionally, add removed dates back to availableDates
    const removedDates = dates.map((d) => new Date(d));
    venue.availableDates.push(...removedDates);

    await venue.save();

    const removedCount = originalLength - venue.bookedDates.length;

    res.status(200).json({
      message: `${removedCount} booking(s) removed successfully`,
      updatedBookings: venue.bookedDates,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
