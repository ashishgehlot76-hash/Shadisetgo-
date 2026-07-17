const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, role, city } = req.body;
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: "Naam, phone, password, aur role zaroori hai" });
    }
    if (!["customer", "vendor"].includes(role)) {
      return res.status(400).json({ error: "Role sirf customer ya vendor ho sakta hai (admin alag se banega)" });
    }
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "Is phone number se pehle se account hai, login karo" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, passwordHash, role, city });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Kuch galat ho gaya: " + err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: "Account nahi mila, pehle register karo" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: "Password galat hai" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Kuch galat ho gaya: " + err.message });
  }
});

module.exports = router;
