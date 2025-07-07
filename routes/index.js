var express = require("express");
const { register, login } = require("../controllers/userController");
const { createVenue, getVenues, getVenueById, bookDate } = require("../controllers/venueController");
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

router.post("/register", register);
router.post("/login", login);

router.post("/venues", createVenue);
router.get("/venues", getVenues);
router.get("/venues/:id", getVenueById);
router.post("/venues/:id/book", bookDate);

module.exports = router;
