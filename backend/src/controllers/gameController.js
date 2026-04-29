const { body } = require("express-validator");
const Game = require("../models/Game");
const User = require("../models/User");

const isValidDeployedUrl = (url) => {
  const pattern = /^(https:\/\/)(.+)\.(netlify\.app|vercel\.app|github\.io|itch\.io|onrender\.com|pages\.dev|firebaseapp\.com|web\.app|surge\.sh|railway\.app)(\/.*)?$/i;
  return pattern.test(url);
};

const gameValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().isLength({ min: 50 }).withMessage("Description should be detailed (min 50 chars)"),
  body("tags").isArray({ min: 1 }).withMessage("At least one tag is required"),
  body("thumbnail").isURL().withMessage("Thumbnail must be a valid URL"),
  body("genre").trim().notEmpty().withMessage("Genre is required"),
  body("gameLink")
    .custom((value) => isValidDeployedUrl(value))
    .withMessage("Only deployed game links are allowed (Netlify, Vercel, GitHub Pages, itch.io, etc.)"),
  body("structuredDescription.overview").trim().notEmpty().withMessage("Overview section is required"),
  body("structuredDescription.gameplay").trim().notEmpty().withMessage("Gameplay section is required"),
  body("structuredDescription.developerNotes").trim().notEmpty().withMessage("Developer notes section is required")
];

const createGame = async (req, res) => {
  const game = await Game.create({
    ...req.body,
    developerId: req.user._id
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { games: game._id } });

  return res.status(201).json(game);
};

const getGames = async (req, res) => {
  const { search = "", genre, sort = "new" } = req.query;

  const query = {
    title: { $regex: search, $options: "i" }
  };

  if (genre && genre !== "all") {
    query.genre = genre;
  }

  const sortOptions =
    sort === "popular"
      ? { averageRating: -1, ratingCount: -1 }
      : { createdAt: -1 };

  const games = await Game.find(query)
    .sort(sortOptions)
    .populate("developerId", "name avatar")
    .select("title thumbnail tags genre averageRating ratingCount gameLink developerId createdAt");

  return res.json(games);
};

const getGameById = async (req, res) => {
  const game = await Game.findById(req.params.id)
    .populate("developerId", "name avatar bio")
    .populate({ path: "comments", populate: { path: "userId", select: "name avatar role" }, options: { sort: { createdAt: -1 } } })
    .populate({ path: "ratings", populate: { path: "userId", select: "name" } });

  if (!game) {
    return res.status(404).json({ message: "Game not found" });
  }

  return res.json(game);
};

const getMyGames = async (req, res) => {
  const games = await Game.find({ developerId: req.user._id }).sort({ createdAt: -1 });
  return res.json(games);
};

const deleteMyGame = async (req, res) => {
  const game = await Game.findOneAndDelete({ _id: req.params.id, developerId: req.user._id });
  if (!game) {
    return res.status(404).json({ message: "Game not found or not owned by you" });
  }
  await User.findByIdAndUpdate(req.user._id, { $pull: { games: game._id } });
  return res.json({ message: "Game removed" });
};

module.exports = { gameValidation, createGame, getGames, getGameById, getMyGames, deleteMyGame };

