import { useState, useEffect } from "react";
import { CATEGORIES, PAYMENT_METHODS, STATUS_OPTIONS } from "../constants";

const todayStr = () => new Date().toISOString().slice(0, 10);

const SUGGESTIONS = {
  expense: [
    "Campus Cafeteria Lunch",
    "Monthly Grocery & Essentials",
    "High-Speed Wi-Fi Bill",
    "Uber Ride to Campus",
    "Textbook & Stationery",
    "Weekend Movie & Popcorn",
    "Third Wave Coffee",
    "Gym Membership Renewal",
  ],
  income: [
    "Semester Lab Stipend",
    "Freelance Web Development",
    "Private Tutoring Session",
    "Stock Market Dividend",
    "Quarterly Research Grant",
    "Cashback & Rewards",
  ],
};

const POPULAR_TAGS = ["college", "food", "bills", "tech", "groceries", "travel", "freelance", "health"];

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  defaultType = "expense",
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: defaultType,
    category: "Food & Dining",
    paymentMethod: "UPI",
    merchant: "",
    status: "Completed",
    notes: "",
    tags: "",
    isRecurring: false,
    date: todayStr(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount !== undefined ? String(initialData.amount) : "",
        type: initialData.type || "expense",
        category: initialData.category || "Food & Dining",
        paymentMethod: initialData.paymentMethod || "UPI",
        merchant: initialData.merchant || "",
        status: initialData.status || "Completed",
        notes: initialData.notes || "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags || "",
        isRecurring: Boolean(initialData.isRecurring),
        date: (initialData.date || todayStr()).slice(0, 10),
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        type: defaultType,
        category: defaultType === "income" ? "Salary & Stipend" : "Food & Dining",
        paymentMethod: "UPI",
        merchant: "",
        status: "Completed",
        notes: "",
        tags: "",
        isRecurring: false,
        date: todayStr(),
      });
    }
  }, [initialData, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Please enter a title");
    if (!formData.amount || Number(formData.amount) <= 0) {
      return alert("Please enter a valid positive amount");
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      tags: formData.tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
    };

    onSave(payload);
  };

  const handleAddTag = (tag) => {
    const current = formData.tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    if (!current.includes(tag)) {
      setFormData({ ...formData, tags: [...current, tag].join(", ") });
    }
  };

  const suggestions = SUGGESTIONS[formData.type] || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? "✏️ Edit Transaction" : "✨ New Financial Transaction"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Type Toggle: Expense vs Income */}
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-btn expense ${formData.type === "expense" ? "active" : ""}`}
              onClick={() =>
                setFormData({
                  ...formData,
                  type: "expense",
                  category: formData.category === "Salary & Stipend" ? "Food & Dining" : formData.category,
                })
              }
            >
              🔴 Expense (Outflow)
            </button>
            <button
              type="button"
              className={`type-btn income ${formData.type === "income" ? "active" : ""}`}
              onClick={() =>
                setFormData({
                  ...formData,
                  type: "income",
                  category: formData.category === "Food & Dining" ? "Salary & Stipend" : formData.category,
                })
              }
            >
              🟢 Income (Inflow)
            </button>
          </div>

          {/* Title with Suggestions */}
          <div className="form-group">
            <label>Transaction Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery Shopping, Cafeteria, Freelance Client"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="quick-suggestions">
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="suggestion-pill"
                  onClick={() => setFormData({ ...formData, title: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="form-row-2">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <div className="input-currency-wrap">
                <span className="cur-sym">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Payment Method in 2 columns */}
          <div className="form-row-2">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {Object.entries(CATEGORIES).map(([catName, cfg]) => (
                  <option key={catName} value={catName}>
                    {cfg.icon} {catName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.icon} {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Merchant / Vendor & Status in 2 columns */}
          <div className="form-row-2">
            <div className="form-group">
              <label>Merchant / Payee (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Amazon, Swiggy, Uber, PVR"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Transaction Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st === "Completed" ? "✅ Completed" : "⏳ Pending"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. college, study, friends, weekend"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <div className="quick-suggestions">
              {POPULAR_TAGS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  className="suggestion-pill"
                  onClick={() => handleAddTag(pt)}
                >
                  #{pt}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes & Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add details, bill numbers, reimbursement or split info..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          {/* Recurring Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              />
              <span>🔁 Mark as recurring subscription / bill</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? "Update Transaction" : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
