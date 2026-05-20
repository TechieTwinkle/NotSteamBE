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
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

// Registration no longer accepts a profile picture upload — users start with
// a default DiceBear avatar and can change it later on their profile page.
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/google", googleAuthValidation, validate, googleAuth);
router.get("/me", protect, me);
router.post("/logout", logout);

module.exports = router;
