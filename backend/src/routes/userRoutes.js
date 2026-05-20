const express = require("express");
const {
  getUserById,
  getMe,
  updateProfileValidation,
  updateMe,
  updateProfilePicture,
  PRESET_AVATARS
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { uploadProfilePicture } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

// ── authenticated user ────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfileValidation, validate, updateMe);

// ── profile picture (dual-option) ─────────────────────────────────────────────
// Option A: body { avatarUrl: "https://..." }    (pre-defined avatar)
// Option B: multipart/form-data  profilePicture  (local file upload)
router.put(
  "/profile-picture",
  protect,
  (req, res, next) => uploadProfilePicture(req, res, (err) => (err ? next(err) : next())),
  updateProfilePicture
);

// ── serve the list of pre-defined avatars so the frontend stays in sync ───────
router.get("/avatars", (_req, res) => res.json(PRESET_AVATARS));

// ── public profile ────────────────────────────────────────────────────────────
router.get("/:id", getUserById);

module.exports = router;
