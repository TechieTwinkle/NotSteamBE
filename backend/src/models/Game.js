const mongoose = require("mongoose");

const gameSectionSchema = new mongoose.Schema(
  {
    overview: { type: String, required: true },
    gameplay: { type: String, required: true },
    developerNotes: { type: String, required: true }
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    genre: { type: String, default: "Indie" },
    thumbnail: { type: String, required: true },
    gameLink: { type: String, required: true },
    developerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    structuredDescription: { type: gameSectionSchema, required: true },
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);

