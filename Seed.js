require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const phone = "9999999999";
  const password = "admin123";

  const existing = await User.findOne({ phone });
  if (existing) {
    console.log("Admin pehle se bana hua hai is phone number se.");
    process.exit(0);
  }

  const passwordHash
