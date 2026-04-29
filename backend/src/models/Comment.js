const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    text: { type: String, required: true, trim: true },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);

