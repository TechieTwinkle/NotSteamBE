const { body } = require("express-validator");
const Rating = require("../models/Rating");
const Game = require("../models/Game");

const ratingValidation = [
  body("gameId").isMongoId().withMessage("Valid gameId is required"),
  body("value").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")
];

const rateGame = async (req, res) => {
  const { gameId, value } = req.body;

  const game = await Game.findById(gameId);
  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  const rating = await Rating.findOneAndUpdate(
    { userId: req.user._id, gameId },
    { value },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!game.ratings.some((id) => id.toString() === rating._id.toString())) {
    game.ratings.push(rating._id);
  }

  const stats = await Rating.aggregate([
    { $match: { gameId: game._id } },
    {
      $group: {
        _id: "$gameId",
        averageRating: { $avg: "$value" },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (stats[0]) {
    game.averageRating = Number(stats[0].averageRating.toFixed(2));
    game.ratingCount = stats[0].ratingCount;
  }

  await game.save();

  return res.json({
    message: "Rating submitted",
    averageRating: game.averageRating,
    ratingCount: game.ratingCount
  });
};

module.exports = { ratingValidation, rateGame };

