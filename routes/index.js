var express = require("express");
const { register, login, me } = require("../controllers/userController");
const {
  createVenue,
  getVenues,
  getVenueById,
  bookDate,
  removeBookDate,
  updateVenue,
  deleteVenue,
  getAllVenues,
} = require("../controllers/venueController");
const { getAdmins } = require("../controllers/adminController");
var router = express.Router();

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "Server is Running",
  });
});

router.post("/me", me);
router.post("/login", login);
router.post("/register", register);

router.get("/admins", getAdmins);

router.get("/allvenues", getAllVenues);

router.get("/venues", getVenues);
router.post("/venues", createVenue);
router.put("/venues", updateVenue);
router.get("/venues/:id", getVenueById);
router.delete("/venues/:id", deleteVenue);

router.post("/venues/:id/book", bookDate);
router.post("/venues/:id/remove-book", removeBookDate);

module.exports = router;
