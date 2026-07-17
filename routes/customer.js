const express = require("express");
const Vendor = require("../models/Vendor");
const Inquiry = require("../models/Inquiry");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/vendors", async (req, res) => {
  const { category, city } = req.query;
  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(city, "i");

  const vendors = await Vendor.find(filter).select(
    "businessName category city priceRangeMin priceRangeMax portfolioNote isPremium rating"
  ).sort({ isPremium: -1, rating: -1 });

  res.json({ vendors });
});

router.post("/inquiry", auth("customer"), async (req, res) => {
  try {
    const { category, city, eventDate, budget, message } = req.body;
    if (!category || !city || !eventDate || !budget) {
      return res.status(400).json({ error: "Category, city, event date, aur budget zaroori hai" });
    }
    const inquiry = await Inquiry.create({
      customerId: req.user.id,
      category,
      city,
      eventDate,
      budget,
      message,
    });
    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ error: "Kuch galat ho gaya: " + err.message });
  }
});

router.get("/inquiries", auth("customer"), async (req, res) => {
  const inquiries = await Inquiry.find({ customerId: req.user.id }).sort({ createdAt: -1 });
  res.json({ inquiries });
});

module.exports = router;
