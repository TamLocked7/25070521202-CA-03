import { useState, useEffect } from "react";

const GOAL_CATEGORIES = ["Savings", "Gadgets", "Travel", "Education", "Emergency", "Vehicle", "Home", "Other"];
const COLOR_OPTIONS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6", "#3b82f6"];

export default function GoalModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "0",
    category: "Savings",
    deadline: "",
    color: "#6366f1",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        targetAmount: initialData.targetAmount ? String(initialData.targetAmount) : "",
        currentAmount: initialData.currentAmount !== undefined ? String(initialData.currentAmount) : "0",
        category: initialData.category || "Savings",
        deadline: initialData.deadline ? initialData.deadline.slice(0, 10) : "",
        color: initialData.color || "#6366f1",
      });
    } else {
      setFormData({
        title: "",
        targetAmount: "",
        currentAmount: "0",
        category: "Savings",
        deadline: "",
        color: "#6366f1",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Please enter a goal title");
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      return alert("Target amount must be greater than zero");
    }

    onSave({
      ...formData,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Math.max(0, Number(formData.currentAmount) || 0),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? "✏️ Edit Savings Goal" : "🎯 New Savings Goal"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. M3 MacBook Pro, Emergency Contingency Fund"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Target Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 50000"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Current Saved (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {GOAL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Deadline (Optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Theme Accent Color</label>
            <div className="color-picker-row">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${formData.color === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setFormData({ ...formData, color: c })}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? "Update Goal" : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
