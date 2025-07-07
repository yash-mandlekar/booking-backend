const Venue = require("../routes/dharamshala");

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

// Get all venues
exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single venue
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Book a date
exports.bookDate = async (req, res) => {
  try {
    const { date } = req.body;
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ message: "Venue not found" });

    if (venue.bookedDates.includes(date))
      return res.status(400).json({ message: "Date already booked" });

    venue.bookedDates.push(date);
    venue.availableDates = venue.availableDates.filter((d) => d !== date);
    await venue.save();

    res.json({ message: "Date booked successfully", venue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
