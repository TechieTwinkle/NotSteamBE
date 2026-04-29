const express = require("express");
const { getUserById, getMe, updateProfileValidation, updateMe } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfileValidation, validate, updateMe);
router.get("/:id", getUserById);

module.exports = router;

