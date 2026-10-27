const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    category: { type: String, default: "Food & Dining", trim: true },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash"],
      default: "UPI",
    },
    merchant: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Completed",
    },
    notes: { type: String, trim: true, default: "" },
    tags: [{ type: String, trim: true }],
    isRecurring: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
