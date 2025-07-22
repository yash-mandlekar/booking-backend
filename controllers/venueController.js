const Venue = require("../routes/dharamshala");
const userModel = require("../routes/users");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
      venues = await Venue.find().populate("owner");
    } else {
      // Return venues owned by this admin
      venues = await Venue.find({ owner: user._id }).populate("owner");
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

// Configure Nodemailer transporter

// Helper function to send emails
const sendEmail = async (to, subject, templateData) => {
  try {
    const mailOptions = {
      from: `"Booking System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: generateEmailTemplate(templateData),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Email template generator
const generateEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { margin-top: 20px; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${data.subject}</h2>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          ${data.message}
          ${data.dates ? `<p><strong>Date(s):</strong> ${data.dates}</p>` : ""}
          ${data.event ? `<p><strong>Event:</strong> ${data.event}</p>` : ""}
          <p>Thank you for using Bijalpur Dharmshala Booking System.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Bijalpur Dharmshala. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

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

    // Send confirmation emails
    for (const booking of validBookings) {
      if (booking.email) {
        try {
          await sendEmail(booking.email, "Booking Confirmation", {
            name: booking.name,
            subject: "Booking Successful",
            message: "Your booking has been confirmed successfully.",
            dates: new Date(booking.date).toLocaleDateString(),
            event: booking.event,
          });
        } catch (emailError) {
          console.error(
            `Failed to send confirmation email to ${booking.email}:`,
            emailError
          );
        }
      }
    }

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
    const { id } = req.params;

    // Validate input
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        message:
          "Invalid request: Please provide a non-empty array of dates to remove.",
        code: "INVALID_INPUT",
      });
    }

    // Validate each date format
    const invalidDates = dates.filter((date) =>
      isNaN(new Date(date).getTime())
    );
    if (invalidDates.length > 0) {
      return res.status(400).json({
        message: `Invalid date format for: ${invalidDates.join(", ")}`,
        code: "INVALID_DATE_FORMAT",
        invalidDates,
      });
    }

    // Find venue with booked dates
    const venue = await Venue.findById(id).select("bookedDates availableDates");
    if (!venue) {
      return res.status(404).json({
        message: "Venue not found",
        code: "VENUE_NOT_FOUND",
      });
    }

    // Normalize dates for comparison
    const dateSetToRemove = new Set(
      dates.map((d) => new Date(d).toISOString().split("T")[0])
    );

    // Track affected users for notifications
    const removedBookings = venue.bookedDates.filter((booking) =>
      dateSetToRemove.has(new Date(booking.date).toISOString().split("T")[0])
    );

    // Filter out the bookings to be removed
    venue.bookedDates = venue.bookedDates.filter(
      (booking) =>
        !dateSetToRemove.has(new Date(booking.date).toISOString().split("T")[0])
    );

    // Add removed dates back to availableDates (with deduplication)
    const uniqueRemovedDates = [...new Set(dates.map((d) => new Date(d)))];

    venue.availableDates = [
      ...new Set([
        ...venue.availableDates.map((d) => d.toISOString()),
        ...uniqueRemovedDates.map((d) => d.toISOString()),
      ]),
    ].map((d) => new Date(d));

    // Save changes
    await venue.save();

    // Send cancellation emails
    for (const booking of removedBookings) {
      if (booking.email) {
        try {
          await sendEmail(booking.email, "Booking Cancellation", {
            name: booking.name,
            subject: "Booking Cancelled",
            message:
              "We regret to inform you that your booking has been cancelled.",
            dates: new Date(booking.date).toLocaleDateString(),
            event: booking.event,
          });
        } catch (emailError) {
          console.error(
            `Failed to send cancellation email to ${booking.email}:`,
            emailError
          );
        }
      }
    }

    // Prepare response
    const response = {
      message: `${removedBookings.length} booking(s) removed successfully`,
      removedCount: removedBookings.length,
      affectedDates: dates,
      updatedBookingsCount: venue.bookedDates.length,
      affectedUsers: removedBookings.map((b) => ({
        email: b.email,
        name: b.name,
        date: b.date,
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(`Error removing bookings for venue ${req.params.id}:`, err);

    // Handle specific errors
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid venue ID format",
        code: "INVALID_ID_FORMAT",
      });
    }

    res.status(500).json({
      message: "Internal server error while processing booking removal",
      code: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
