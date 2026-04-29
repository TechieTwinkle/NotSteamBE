const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const avatarByGender = (name, gender = "other") => {
  const style = gender === "female" ? "micah" : gender === "male" ? "avataaars" : "adventurer";
  const seed = encodeURIComponent(name || "notsteam");
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`;
};

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["developer", "player"]).withMessage("Role must be developer or player"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other")
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

const register = async (req, res) => {
  const { name, email, password, role, gender = "other" } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    gender,
    avatar: avatarByGender(name, gender)
  });

  return res.status(201).json({
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      activity: user.activity,
      bio: user.bio,
      avatar: user.avatar
    }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
      activity: user.activity,
      bio: user.bio,
      avatar: user.avatar
    }
  });
};

module.exports = { registerValidation, loginValidation, register, login };

