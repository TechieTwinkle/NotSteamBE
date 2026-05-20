const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const avatarByGender = (name, gender = "other") => {
  const style = gender === "female" ? "micah" : gender === "male" ? "avataaars" : "adventurer";
  const seed = encodeURIComponent(name || "notsteam");
  return `https://api.dicebear.com/8.x/${style}/svg?seed=${seed}`;
};

const profilePicturePathToUrl = (req) => {
  if (!req.file) return "";
  const relativePath = req.file.path.split("uploads\\")[1] || req.file.path.split("uploads/")[1];
  return `${req.protocol}://${req.get("host")}/uploads/${relativePath.replaceAll("\\", "/")}`;
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  gender: user.gender,
  activity: user.activity,
  bio: user.bio,
  avatar: user.avatar,
  profilePictureUrl: user.profilePictureUrl || "",
  googleId: user.googleId || null
});

const setAuthCookie = (res, token) => {
  res.cookie("authToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["developer", "player"]).withMessage("Role must be developer or player"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other")
];

const googleAuthValidation = [
  body("googleToken").notEmpty().withMessage("Google token is required"),
  body("role").optional().isIn(["developer", "player"]).withMessage("Role must be developer or player")
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

  // No profile picture at registration — user can set one later on their
  // profile page. They start with a gender-based DiceBear avatar.
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    gender,
    avatar: avatarByGender(name, gender),
    profilePictureUrl: ""
  });

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({
    token,
    user: serializeUser(user)
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

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.json({ token, user: serializeUser(user) });
};

const googleAuth = async (req, res) => {
  const { googleToken, role = "player" } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload?.sub) {
    return res.status(401).json({ message: "Invalid Google token payload" });
  }

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      role,
      gender: "other",
      googleId: payload.sub,
      avatar: payload.picture || avatarByGender(payload.name || payload.email, "other"),
      profilePictureUrl: payload.picture || ""
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    if (!user.profilePictureUrl && payload.picture) {
      user.profilePictureUrl = payload.picture;
      user.avatar = payload.picture;
    }
    await user.save();
  }

  const token = signToken(user);
  setAuthCookie(res, token);

  return res.json({ token, user: serializeUser(user) });
};

const me = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.json({ user: serializeUser(user) });
};

const logout = (_req, res) => {
  res.clearCookie("authToken");
  return res.json({ message: "Logged out" });
};

module.exports = {
  registerValidation,
  loginValidation,
  googleAuthValidation,
  register,
  login,
  googleAuth,
  me,
  logout
};

