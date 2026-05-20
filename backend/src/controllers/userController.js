const path = require("path");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { body } = require("express-validator");

// ─── helpers ──────────────────────────────────────────────────────────────────

// Build a full URL from the multer-saved file path
const fileToUrl = (req) => {
  if (!req.file) return "";
  // Normalize path separators so it works on both Windows and Linux
  const relative = req.file.path
    .split("uploads" + path.sep)[1]
    ?.replaceAll("\\", "/");
  return `${req.protocol}://${req.get("host")}/uploads/${relative}`;
};

// Allowed pre-defined avatar URLs — we validate against this list so
// users can't inject arbitrary URLs into the database.
const PRESET_AVATARS = [
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Midnight",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Blaze",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=Storm",
  "https://api.dicebear.com/8.x/avataaars/svg?seed=Neon",
  "https://api.dicebear.com/8.x/micah/svg?seed=Pixel",
  "https://api.dicebear.com/8.x/micah/svg?seed=Aurora",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Circuit",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Voltage",
];

const avatarByGender = (name, gender = "other") => {
  const style = gender === "female" ? "micah" : gender === "male" ? "avataaars" : "adventurer";
  const seed = encodeURIComponent(name || "notsteam");
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`;
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("games", "title thumbnail averageRating createdAt")
    .populate("playedGames", "title thumbnail");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const reviews = await Comment.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("gameId", "title");

  return res.json({ ...user.toObject(), activityFeed: reviews });
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("games", "title thumbnail averageRating createdAt")
    .populate("playedGames", "title thumbnail");

  const activityFeed = await Comment.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("gameId", "title");

  return res.json({ ...user.toObject(), activityFeed });
};

const updateProfileValidation = [
  body("bio").optional().isString().isLength({ max: 1000 }).withMessage("Bio is too long"),
  body("activity").optional().isString().isLength({ max: 280 }).withMessage("Activity is too long"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other")
];

const updateMe = async (req, res) => {
  const { bio, activity, gender } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (typeof bio === "string") user.bio = bio;
  if (typeof activity === "string") user.activity = activity;
  if (gender) {
    user.gender = gender;
    if (!user.profilePictureUrl) {
      user.avatar = avatarByGender(user.name, gender);
    }
  }

  await user.save();

  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    gender: user.gender,
    bio: user.bio,
    activity: user.activity,
    avatar: user.avatar,
    profilePictureUrl: user.profilePictureUrl || ""
  });
};

// ─── profile picture update ─────────────────────────────────────────────────
// Handles both Option A (pre-defined avatar URL) and Option B (file upload).

const updateProfilePicture = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  let newUrl = "";

  if (req.file) {
    // Option B — user uploaded a local image (multer already validated type + size)
    newUrl = fileToUrl(req);
  } else if (req.body.avatarUrl) {
    // Option A — user picked a pre-defined avatar
    if (!PRESET_AVATARS.includes(req.body.avatarUrl)) {
      return res.status(400).json({ message: "Invalid avatar selection" });
    }
    newUrl = req.body.avatarUrl;
  } else {
    return res.status(400).json({ message: "No image or avatar provided" });
  }

  // Persist the new picture in both fields so every read path resolves it
  user.profilePictureUrl = newUrl;
  user.avatar = newUrl;
  await user.save();

  return res.json({
    id: user._id,
    avatar: user.avatar,
    profilePictureUrl: user.profilePictureUrl
  });
};

module.exports = {
  getUserById,
  getMe,
  updateProfileValidation,
  updateMe,
  updateProfilePicture,
  PRESET_AVATARS
};

