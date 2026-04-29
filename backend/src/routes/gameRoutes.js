const express = require("express");
const {
  createGame,
  getGames,
  getGameById,
  gameValidation,
  getMyGames,
  deleteMyGame
} = require("../controllers/gameController");
const { protect, authorizeRole } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/", getGames);
router.get("/developer/me", protect, authorizeRole("developer"), getMyGames);
router.get("/:id", getGameById);
router.post("/", protect, authorizeRole("developer"), gameValidation, validate, createGame);
router.delete("/:id", protect, authorizeRole("developer"), deleteMyGame);

module.exports = router;

