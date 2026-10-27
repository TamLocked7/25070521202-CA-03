const router = require("express").Router();
const Expense = require("../models/Expense");

// Sample seed data generator for professor demo
const sampleExpenses = [
  {
    title: "Semester Tuition Stipend",
    amount: 35000,
    type: "income",
    category: "Salary & Stipend",
    paymentMethod: "Net Banking",
    merchant: "University Finance Dept",
    status: "Completed",
    notes: "Research lab assistance stipend for current semester",
    tags: ["college", "stipend"],
    date: new Date(Date.now() - 25 * 86400000),
  },
  {
    title: "Freelance React Dashboard Project",
    amount: 18500,
    type: "income",
    category: "Freelance & Gigs",
    paymentMethod: "UPI",
    merchant: "Upwork Client",
    status: "Completed",
    notes: "Milestone 2 payment received",
    tags: ["freelance", "coding"],
    date: new Date(Date.now() - 14 * 86400000),
  },
  {
    title: "Campus Cafeteria & Snacks",
    amount: 420,
    type: "expense",
    category: "Food & Dining",
    paymentMethod: "UPI",
    merchant: "Campus Bistro",
    status: "Completed",
    notes: "Lunch with study group",
    tags: ["food", "friends"],
    date: new Date(Date.now() - 1 * 86400000),
  },
  {
    title: "Monthly Grocery & Supplies",
    amount: 3200,
    type: "expense",
    category: "Food & Dining",
    paymentMethod: "Credit Card",
    merchant: "SuperMart",
    status: "Completed",
    notes: "Fresh produce, oats, almond milk, and pantry refills",
    tags: ["groceries", "home"],
    date: new Date(Date.now() - 3 * 86400000),
  },
  {
    title: "High-Speed Fiber Broadband",
    amount: 999,
    type: "expense",
    category: "Bills & Utilities",
    paymentMethod: "UPI",
    merchant: "Airtel Broadband",
    status: "Completed",
    notes: "200 Mbps unlimited monthly plan",
    tags: ["utilities", "internet"],
    date: new Date(Date.now() - 5 * 86400000),
  },
  {
    title: "Uber Ride to Tech Meetup",
    amount: 340,
    type: "expense",
    category: "Travel & Transport",
    paymentMethod: "UPI",
    merchant: "Uber India",
    status: "Completed",
    notes: "Attending GDG Developer Fest",
    tags: ["travel", "tech"],
    date: new Date(Date.now() - 6 * 86400000),
  },
  {
    title: "Algorithm & Data Structures Textbook",
    amount: 1450,
    type: "expense",
    category: "Education & College",
    paymentMethod: "Debit Card",
    merchant: "Amazon Books",
    status: "Completed",
    notes: "CLRS reference book for CS semester",
    tags: ["study", "books"],
    date: new Date(Date.now() - 8 * 86400000),
  },
  {
    title: "Movie Tickets & Popcorn Combo",
    amount: 750,
    type: "expense",
    category: "Entertainment & OTT",
    paymentMethod: "Credit Card",
    merchant: "PVR Cinemas",
    status: "Completed",
    notes: "Weekend evening show",
    tags: ["entertainment", "weekend"],
    date: new Date(Date.now() - 9 * 86400000),
  },
  {
    title: "Gym Membership Monthly Pass",
    amount: 1500,
    type: "expense",
    category: "Health & Fitness",
    paymentMethod: "UPI",
    merchant: "FitLife Gym",
    status: "Completed",
    notes: "Cardio & strength training renewal",
    tags: ["fitness", "health"],
    date: new Date(Date.now() - 11 * 86400000),
  },
  {
    title: "Wireless Ergonomic Mouse",
    amount: 1899,
    type: "expense",
    category: "Shopping & Retail",
    paymentMethod: "Credit Card",
    merchant: "Logitech Official",
    status: "Completed",
    notes: "Ergonomic productivity setup",
    tags: ["tech", "gadgets"],
    date: new Date(Date.now() - 15 * 86400000),
  },
  {
    title: "Electricity & Room Utility Bill",
    amount: 1850,
    type: "expense",
    category: "Bills & Utilities",
    paymentMethod: "Net Banking",
    merchant: "State Power Board",
    status: "Completed",
    notes: "Split 50% with flatmate",
    tags: ["bills", "room"],
    date: new Date(Date.now() - 18 * 86400000),
  },
  {
    title: "Weekend Metro Card Recharge",
    amount: 500,
    type: "expense",
    category: "Travel & Transport",
    paymentMethod: "UPI",
    merchant: "Metro Rail Corp",
    status: "Completed",
    notes: "Monthly smart card top-up",
    tags: ["travel", "commute"],
    date: new Date(Date.now() - 20 * 86400000),
  },
  {
    title: "Stock Dividend Payout",
    amount: 1250,
    type: "income",
    category: "Investment & Savings",
    paymentMethod: "Net Banking",
    merchant: "Zerodha Demat",
    status: "Completed",
    notes: "Quarterly dividend from Nifty 50 Index ETF",
    tags: ["investments", "passive"],
    date: new Date(Date.now() - 22 * 86400000),
  },
  {
    title: "Coffee & Pastry at Cafe",
    amount: 280,
    type: "expense",
    category: "Food & Dining",
    paymentMethod: "Cash",
    merchant: "Third Wave Coffee",
    status: "Completed",
    notes: "Study session coffee",
    tags: ["coffee", "chill"],
    date: new Date(Date.now() - 2 * 86400000),
  },
  {
    title: "Domain & Cloud Hosting Renewal",
    amount: 1200,
    type: "expense",
    category: "Bills & Utilities",
    paymentMethod: "Credit Card",
    merchant: "DigitalOcean / Namecheap",
    status: "Completed",
    notes: "Hosting portfolio projects",
    tags: ["dev", "servers"],
    date: new Date(Date.now() - 28 * 86400000),
  },
];

// READ all with advanced filters
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      type,
      paymentMethod,
      status,
      startDate,
      endDate,
      sort = "newest",
      limit,
      page,
    } = req.query;

    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (type && type !== "All") {
      query.type = type.toLowerCase();
    }

    if (paymentMethod && paymentMethod !== "All") {
      query.paymentMethod = paymentMethod;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { merchant: regex },
        { notes: regex },
        { category: regex },
        { tags: { $in: [regex] } },
      ];
    }

    // Sort order
    let sortObj = { date: -1, _id: -1 };
    if (sort === "oldest") sortObj = { date: 1, _id: 1 };
    if (sort === "high") sortObj = { amount: -1 };
    if (sort === "low") sortObj = { amount: 1 };
    if (sort === "title") sortObj = { title: 1 };

    let dbQuery = Expense.find(query).sort(sortObj);

    // Optional pagination
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const total = await Expense.countDocuments(query);
      const items = await dbQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
      return res.json({
        items,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    const items = await dbQuery;
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET aggregated statistics
router.get("/stats", async (req, res) => {
  try {
    const expenses = await Expense.find();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const paymentMethodTotals = {};
    const monthlyStats = {};

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;

    expenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      const isExp = item.type !== "income";
      const dateStr = item.date ? new Date(item.date).toISOString().slice(0, 7) : currentMonthKey;

      if (!monthlyStats[dateStr]) {
        monthlyStats[dateStr] = { income: 0, expense: 0 };
      }

      if (isExp) {
        totalExpense += amt;
        monthlyStats[dateStr].expense += amt;
        if (dateStr === currentMonthKey) thisMonthExpense += amt;

        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amt;
      } else {
        totalIncome += amt;
        monthlyStats[dateStr].income += amt;
        if (dateStr === currentMonthKey) thisMonthIncome += amt;
      }

      const pm = item.paymentMethod || "UPI";
      paymentMethodTotals[pm] = (paymentMethodTotals[pm] || 0) + amt;
    });

    res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      thisMonthIncome,
      thisMonthExpense,
      currentMonthBalance: thisMonthIncome - thisMonthExpense,
      count: expenses.length,
      categoryTotals,
      paymentMethodTotals,
      monthlyStats,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, merchant, status, notes, tags, isRecurring, date } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (amount === undefined || amount === null || Number(amount) < 0) {
      return res.status(400).json({ error: "Valid positive amount is required" });
    }

    const item = await Expense.create({
      title: title.trim(),
      amount: Number(amount),
      type: type === "income" ? "income" : "expense",
      category: category || "Food & Dining",
      paymentMethod: paymentMethod || "UPI",
      merchant: merchant ? merchant.trim() : "",
      status: status || "Completed",
      notes: notes ? notes.trim() : "",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      isRecurring: Boolean(isRecurring),
      date: date ? new Date(date) : new Date(),
    });
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.amount !== undefined) payload.amount = Number(payload.amount);
    if (typeof payload.tags === "string") {
      payload.tags = payload.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    const updated = await Expense.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Transaction not found" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE single
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Deleted successfully", id: req.params.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// BULK DELETE
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Array of transaction IDs is required" });
    }
    const result = await Expense.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Successfully deleted ${result.deletedCount} transactions`, count: result.deletedCount });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// SEED SAMPLE DATA
router.post("/seed", async (req, res) => {
  try {
    // If replace parameter passed, wipe first
    if (req.body.replace) {
      await Expense.deleteMany({});
    }
    const created = await Expense.insertMany(sampleExpenses);
    res.status(201).json({ message: `Successfully seeded ${created.length} sample transactions!`, count: created.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CLEAR ALL (for testing/reset)
router.post("/clear", async (req, res) => {
  try {
    const result = await Expense.deleteMany({});
    res.json({ message: `Cleared all ${result.deletedCount} transactions` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
