const express = require("express");
const Vendor = require("../models/Vendor");
const Inquiry = require("../models/Inquiry");
const Quote = require("../models/Quote");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/vendors/pending", auth("admin"), async (req, res) => {
  const vendors = await Vendor.find({ status: "pending" }).populate("userId", "name phone");
  res.json({ vendors });
});

router.get("/vendors", auth("admin"), async (req, res) => {
  const vendors = await Vendor.find().populate("userId", "name phone");
  res.json({ vendors });
});

router.post("/vendors/:id/approve", auth("admin"), async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: "approved", rejectionReason: undefined },
    { new: true }
  );
  if (!vendor) return res.status(404).json({ error: "Vendor nahi mila" });
  res.json({ vendor });
});

router.post("/vendors/:id/reject", auth("admin"), async (req, res) => {
  const { reason } = req.body;
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", rejectionReason: reason || "Reason nahi diya gaya" },
    { new: true }
  );
  if (!vendor) return res.status(404).json({ error: "Vendor nahi mila" });
  res.json({ vendor });
});

router.post("/vendors/:id/premium", auth("admin"), async (req, res) => {
  const { isPremium } = req.body;
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isPremium: !!isPremium }, { new: true });
  if (!vendor) return res.status(404).json({ error: "Vendor nahi mila" });
  res.json({ vendor });
});

router.get("/inquiries", auth("admin"), async (req, res) => {
  const inquiries = await Inquiry.find().populate("customerId", "name phone").sort({ createdAt: -1 });
  res.json({ inquiries });
});

router.post("/inquiries/:id/assign", auth("admin"), async (req, res) => {
  const { vendorIds } = req.body;
  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { assignedVendorIds: vendorIds, status: "assigned" },
    { new: true }
  );
  if (!inquiry) return res.status(404).json({ error: "Inquiry nahi mili" });
  res.json({ inquiry });
});

router.get("/inquiries/:id/quotes", auth("admin"), async (req, res) => {
  const quotes = await Quote.find({ inquiryId: req.params.id }).populate("vendorId", "businessName city");
  res.json({ quotes });
});

router.post("/inquiries/:id/finalize", auth("admin"), async (req, res) => {
  try {
    const { vendorId, finalPrice, commissionRate } = req.body;
    const rate = commissionRate !== undefined ? commissionRate : 0.1;
    const platformFee = Math.round(finalPrice * rate);
    const vendorPayout = finalPrice - platformFee;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        finalVendorId: vendorId,
        finalPrice,
        commissionRate: rate,
        platformFee,
        vendorPayout,
        status: "deal_done",
      },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ error: "Inquiry nahi mili" });
    res.json({ inquiry });
  } catch (err) {
    res.status(500).json({ error: "Kuch galat ho gaya: " + err.message });
  }
});

router.get("/summary", auth("admin"), async (req, res) => {
  const totalVendors = await Vendor.countDocuments();
  const pendingVendors = await Vendor.countDocuments({ status: "pending" });
  const totalInquiries = await Inquiry.countDocuments();
  const dealsClosed = await Inquiry.countDocuments({ status: "deal_done" });
  const deals = await Inquiry.find({ status: "deal_done" });
  const totalCommission = deals.reduce((sum, d) => sum + (d.platformFee || 0), 0);

  res.json({ totalVendors, pendingVendors, totalInquiries, dealsClosed, totalCommission });
});

module.exports = router;
