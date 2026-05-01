const express = require("express");
const {
  register,
  login,
  googleAuth,
  me,
  logout,
  registerValidation,
  loginValidation,
  googleAuthValidation
} = require("../controllers/authController");
const { uploadProfilePicture } = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/register", (req, res, next) => uploadProfilePicture(req, res, (err) => (err ? next(err) : next())), registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/google", googleAuthValidation, validate, googleAuth);
router.get("/me", protect, me);
router.post("/logout", logout);

module.exports = router;

