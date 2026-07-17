const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    businessName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["photo", "dj", "catering", "mehendi", "decor", "venue", "cards", "pandit", "transport", "anchor"],
    },
    city: { type: String, required: true },
    yearsInBusiness: { type: Number, default: 0 },
    priceRangeMin: { type: Number, required: true },
    priceRangeMax: { type: Number, required: true },
    portfolioNote: { type: String },
    documentsNote: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    isPremium: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
