const router = require("express").Router();
const Goal = require("../models/Goal");

const sampleGoals = [
  {
    title: "Emergency Contingency Fund",
    targetAmount: 25000,
    currentAmount: 18500,
    category: "Emergency",
    deadline: new Date(Date.now() + 60 * 86400000),
    color: "#10b981",
  },
  {
    title: "M2/M3 Development Laptop",
    targetAmount: 80000,
    currentAmount: 42000,
    category: "Gadgets",
    deadline: new Date(Date.now() + 120 * 86400000),
    color: "#6366f1",
  },
  {
    title: "AWS Cloud Architect Certification",
    targetAmount: 12000,
    currentAmount: 9000,
    category: "Education",
    deadline: new Date(Date.now() + 30 * 86400000),
    color: "#f59e0b",
  },
  {
    title: "Graduation Goa Trip",
    targetAmount: 15000,
    currentAmount: 6500,
    category: "Travel",
    deadline: new Date(Date.now() + 90 * 86400000),
    color: "#ec4899",
  },
];

// GET all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find().sort({ deadline: 1, createdAt: -1 });
    res.json(goals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE goal
router.post("/", async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, category, deadline, color } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: "Goal title is required" });
    if (!targetAmount || Number(targetAmount) <= 0) {
      return res.status(400).json({ error: "Target amount must be greater than zero" });
    }
    const goal = await Goal.create({
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Math.max(0, Number(currentAmount) || 0),
      category: category || "Savings",
      deadline: deadline ? new Date(deadline) : undefined,
      color: color || "#6366f1",
    });
    res.status(201).json(goal);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE goal
router.put("/:id", async (req, res) => {
  try {
    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Goal not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ADJUST amount (deposit or withdraw)
router.patch("/:id/adjust", async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== "number") return res.status(400).json({ error: "Delta number is required" });
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    goal.currentAmount = Math.max(0, goal.currentAmount + delta);
    await goal.save();
    res.json(goal);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE goal
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Goal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Goal not found" });
    res.json({ message: "Goal deleted successfully" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// SEED sample goals
router.post("/seed", async (req, res) => {
  try {
    if (req.body.replace) await Goal.deleteMany({});
    const created = await Goal.insertMany(sampleGoals);
    res.status(201).json({ message: `Seeded ${created.length} goals`, count: created.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
