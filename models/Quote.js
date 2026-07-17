const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inquiry", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    price: { type: Number, required: true },
    message: { type: String },
    status: { type: String, enum: ["pending", "selected", "not_selected"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quote", quoteSchema);
