const { body } = require("express-validator");
const Comment = require("../models/Comment");
const Game = require("../models/Game");

const commentValidation = [
  body("gameId").isMongoId().withMessage("Valid gameId is required"),
  body("text").trim().isLength({ min: 2 }).withMessage("Comment should be at least 2 characters"),
  body("parentCommentId").optional({ nullable: true }).isMongoId().withMessage("parentCommentId must be valid")
];

const createComment = async (req, res) => {
  const { gameId, text, parentCommentId = null } = req.body;

  const game = await Game.findById(gameId);
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  const comment = await Comment.create({
    userId: req.user._id,
    gameId,
    text,
    parentCommentId
  });

  await Game.findByIdAndUpdate(gameId, { $push: { comments: comment._id } });

  const populated = await comment.populate("userId", "name avatar role");
  return res.status(201).json(populated);
};

const getCommentsByGame = async (req, res) => {
  const comments = await Comment.find({ gameId: req.params.gameId })
    .populate("userId", "name avatar role")
    .sort({ createdAt: -1 });

  return res.json(comments);
};

module.exports = { commentValidation, createComment, getCommentsByGame };

