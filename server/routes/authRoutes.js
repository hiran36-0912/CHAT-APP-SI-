import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    let { fullName, username, email, password } = req.body;

    // 1. Check required fields
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    fullName = fullName.trim();
    username = username.trim().toLowerCase();
    email = email.trim().toLowerCase();

    // 2. Validate Full Name
    if (fullName.length < 2) {
      return res.status(400).json({ message: "Full Name must be at least 2 characters long" });
    }

    // 3. Validate Username format (alphanumeric and underscore, 3-20 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters and contain only letters, numbers, or underscores",
      });
    }

    // 4. Validate Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // 5. Validate Password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // 6. Check if email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "An account with this email address already exists" });
    }

    // 7. Check if username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "This username is already taken. Please choose another" });
    }

    // 8. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 9. Generate avatar using Dicebear API based on username
    const profilePic = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();

    const token = generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      token,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.error("Error in signup route:", error.message);
    res.status(500).json({ message: "Server error during registration. Please try again." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    let { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Please provide both username/email and password" });
    }

    usernameOrEmail = usernameOrEmail.trim().toLowerCase();

    // Look for user by either email or username
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token,
      message: "Logged in successfully!",
    });
  } catch (error) {
    console.error("Error in login route:", error.message);
    res.status(500).json({ message: "Server error during login. Please try again." });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout route:", error.message);
    res.status(500).json({ message: "Server error during logout" });
  }
});

// GET CURRENT USER PROFILE
router.get("/me", protectRoute, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in me route:", error.message);
    res.status(500).json({ message: "Server error retrieving user data" });
  }
});

export default router;
