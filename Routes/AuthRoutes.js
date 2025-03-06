const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("dotenv").config();

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    console.log("Incoming signup request:", req.body); // Log request data

    const {  firstName,
        middleName,
        lastName,
        email,
        password,
        confirmPassword,
        graduationYear,
        department,
        linkedinProfile} = req.body;

    // Check if all fields are provided
    if (!firstName ||!middleName||!lastName|| !email || !password || !confirmPassword || !graduationYear||!department||!linkedinProfile) {
      return res.status(400).json({ msg: "Please provide all fields" });
    }

    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists:", email);
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ firstName, email, password , confirmPassword });

    await user.save();
    console.log("User saved successfully:", user);

    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error.message); // Log error details
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
});

module.exports = router;