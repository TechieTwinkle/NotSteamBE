const express = require("express");
const { createComment, getCommentsByGame, commentValidation } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/", protect, commentValidation, validate, createComment);
router.get("/:gameId", getCommentsByGame);

module.exports = router;

