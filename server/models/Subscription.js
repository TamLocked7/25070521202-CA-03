const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    billingCycle: {
      type: String,
      enum: ["Monthly", "Yearly", "Weekly"],
      default: "Monthly",
    },
    category: { type: String, default: "Entertainment", trim: true },
    paymentMethod: { type: String, default: "Credit Card", trim: true },
    nextDueDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "Paused"],
      default: "Active",
    },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
