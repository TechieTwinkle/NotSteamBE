const express = require("express");
const { rateGame, ratingValidation } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/", protect, ratingValidation, validate, rateGame);

module.exports = router;

