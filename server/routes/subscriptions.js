const router = require("express").Router();
const Subscription = require("../models/Subscription");

const sampleSubs = [
  {
    name: "Netflix 4K Premium",
    amount: 649,
    billingCycle: "Monthly",
    category: "Entertainment & OTT",
    paymentMethod: "Credit Card",
    nextDueDate: new Date(Date.now() + 12 * 86400000),
    status: "Active",
    notes: "Family sharing 4 screen plan",
  },
  {
    name: "Spotify Premium Student",
    amount: 59,
    billingCycle: "Monthly",
    category: "Entertainment & OTT",
    paymentMethod: "UPI",
    nextDueDate: new Date(Date.now() + 5 * 86400000),
    status: "Active",
    notes: "Student discount active",
  },
  {
    name: "Airtel High-Speed Fiber",
    amount: 999,
    billingCycle: "Monthly",
    category: "Bills & Utilities",
    paymentMethod: "UPI",
    nextDueDate: new Date(Date.now() + 18 * 86400000),
    status: "Active",
    notes: "Home Wi-Fi router line",
  },
  {
    name: "GitHub Copilot Student / Pro",
    amount: 850,
    billingCycle: "Monthly",
    category: "Education & College",
    paymentMethod: "Credit Card",
    nextDueDate: new Date(Date.now() + 22 * 86400000),
    status: "Active",
    notes: "AI pair programming tool",
  },
  {
    name: "FitLife Gym Membership",
    amount: 1500,
    billingCycle: "Monthly",
    category: "Health & Fitness",
    paymentMethod: "Debit Card",
    nextDueDate: new Date(Date.now() + 8 * 86400000),
    status: "Active",
    notes: "Early morning access included",
  },
];

// GET all
router.get("/", async (req, res) => {
  try {
    const subs = await Subscription.find().sort({ nextDueDate: 1 });
    res.json(subs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const { name, amount, billingCycle, category, paymentMethod, nextDueDate, status, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Subscription name is required" });
    if (amount === undefined || Number(amount) < 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    const sub = await Subscription.create({
      name: name.trim(),
      amount: Number(amount),
      billingCycle: billingCycle || "Monthly",
      category: category || "Entertainment & OTT",
      paymentMethod: paymentMethod || "Credit Card",
      nextDueDate: nextDueDate ? new Date(nextDueDate) : new Date(),
      status: status || "Active",
      notes: notes || "",
    });
    res.status(201).json(sub);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updated = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Subscription not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// TOGGLE STATUS
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ error: "Subscription not found" });
    sub.status = sub.status === "Active" ? "Paused" : "Active";
    await sub.save();
    res.json(sub);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Subscription not found" });
    res.json({ message: "Subscription deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// SEED
router.post("/seed", async (req, res) => {
  try {
    if (req.body.replace) await Subscription.deleteMany({});
    const created = await Subscription.insertMany(sampleSubs);
    res.status(201).json({ message: `Seeded ${created.length} subscriptions`, count: created.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
