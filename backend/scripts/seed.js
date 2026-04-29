require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Game = require("../src/models/Game");
const Comment = require("../src/models/Comment");
const Rating = require("../src/models/Rating");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Game.deleteMany({}),
      Comment.deleteMany({}),
      Rating.deleteMany({})
    ]);

    const dev = await User.create({
      name: "Nova Forge",
      email: "dev@notsteam.dev",
      password: await bcrypt.hash("password123", 10),
      role: "developer",
      bio: "A micro indie studio building atmospheric narrative puzzlers.",
      avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=nova"
    });

    const player = await User.create({
      name: "Pixel Wanderer",
      email: "player@notsteam.dev",
      password: await bcrypt.hash("password123", 10),
      role: "player",
      bio: "Plays weird, emotional, and systems-heavy indie gems.",
      avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=player"
    });

    const game = await Game.create({
      title: "Lumen Drift",
      description:
        "Lumen Drift is a story-first exploration game where every puzzle reveals fragments of a drifting city's memory. Navigate rooftops, decode old machine dialects, and decide which districts to restore.",
      tags: ["Narrative", "Puzzle", "Exploration"],
      genre: "Adventure",
      thumbnail:
        "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=1200&q=80",
      gameLink: "https://example-game.netlify.app",
      developerId: dev._id,
      structuredDescription: {
        overview:
          "Lumen Drift follows a courier in a city that floats across a sea of clouds. Players chart district routes and uncover political histories tied to each faction.",
        gameplay:
          "Gameplay blends light platforming with logic-based environmental puzzles. Progression is non-linear, and decisions affect NPC story arcs and district states.",
        developerNotes:
          "Built in public over 10 months. The game emphasizes low-friction controls and layered narrative logs inspired by archival writing."
      },
      averageRating: 4.5,
      ratingCount: 1
    });

    const rating = await Rating.create({ userId: player._id, gameId: game._id, value: 5 });
    const comment = await Comment.create({
      userId: player._id,
      gameId: game._id,
      text: "This worldbuilding is unreal. The rooftop traversal feels smooth and intentional."
    });

    game.ratings = [rating._id];
    game.comments = [comment._id];
    await game.save();

    dev.games = [game._id];
    player.playedGames = [game._id];
    await dev.save();
    await player.save();

    console.log("Seed complete.");
    console.log("Developer login: dev@notsteam.dev / password123");
    console.log("Player login: player@notsteam.dev / password123");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

seed();

