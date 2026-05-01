const User = require("../models/User");
const Comment = require("../models/Comment");
const { body } = require("express-validator");

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
    avatar: user.avatar
  });
};

module.exports = { getUserById, getMe, updateProfileValidation, updateMe };

