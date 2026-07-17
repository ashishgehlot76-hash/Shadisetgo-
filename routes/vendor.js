const express = require("express");
const Vendor = require("../models/Vendor");
const Inquiry = require("../models/Inquiry");
const Quote = require("../models/Quote");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/profile", auth("vendor"), async (req, res) => {
  try {
    const { businessName, category, city, yearsInBusiness, priceRangeMin, priceRangeMax, portfolioNote } = req.body;
    if (!businessName || !category || !city || !priceRangeMin || !priceRangeMax) {
      return res.status(400).json({ error: "Business naam, category, city, aur price range zaroori hai" });
    }

    let vendor = await Vendor.findOne({ userId: req.user.id });
    if (vendor) {
      vendor.businessName = businessName;
      vendor.category = category;
      vendor.city = city;
      vendor.yearsInBusiness = yearsInBusiness || 0;
      vendor.priceRangeMin = priceRangeMin;
      vendor.priceRangeMax = priceRangeMax;
      vendor.portfolioNote = portfolioNote;
      vendor.status = "pending";
      vendor.rejectionReason = undefined;
      await vendor.save();
    } else {
      vendor = await Vendor.create({
        userId: req.user.id,
        businessName,
        category,
        city,
        yearsInBusiness,
        priceRangeMin,
        priceRangeMax,
        portfolioNote,
      });
    }
    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ error: "Kuch galat ho gaya: " + err.message });
  }
});

router.get("/me", auth("vendor"), async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) return res.status(404).json({ error: "Abhi tak profile nahi banayi" });
  res.json({ vendor });
});

router.get("/inquiries", auth("vendor"), async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) return res.status(404).json({ error: "Pehle apni profile banao" });

  const inquiries = await Inquiry.find({ assignedVendorIds: vendor._id }).select(
    "category city eventDate budget message status createdAt"
  );
  res.json({ inquiries });
});

router.post("/quote", auth("vendor"), async (req, res) => {
  try {
    const { inquiryId, price, message } = req.body;
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ error: "Pehle apni profile banao" });

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) return res.status(404).json({ error: "Inquiry nahi mili" });
    if (!inquiry.assignedVendorIds.some((id) => id.equals(vendor._id))) {
      return res.status(403).json({ error: "Ye inquiry aapko assign nahi hui hai" });
    }

    const quote = await Quote.create({ inquiryId, vendorId: vendor._id, price, message });

    if (inquiry.status === "assigned") {
      inquiry.status = "quoted";
      await inquiry.save();
    }

    res.json({ quote });
  } catch (err) {
    res.status(500).json({ error: "Kuch galat ho gaya: " + err.message });
  }
});

module.exports = router;
