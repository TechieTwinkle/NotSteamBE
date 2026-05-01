const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["developer", "player"], required: true },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    bio: { type: String, default: "" },
    activity: { type: String, default: "" },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/8.x/adventurer/svg?seed=notsteam"
    },
    profilePictureUrl: {
      type: String,
      default: ""
    },
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
    playedGames: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

