import { useState, useEffect } from "react";
import { CATEGORIES, PAYMENT_METHODS } from "../constants";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function SubscriptionModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billingCycle: "Monthly",
    category: "Entertainment & OTT",
    paymentMethod: "Credit Card",
    nextDueDate: todayStr(),
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        amount: initialData.amount !== undefined ? String(initialData.amount) : "",
        billingCycle: initialData.billingCycle || "Monthly",
        category: initialData.category || "Entertainment & OTT",
        paymentMethod: initialData.paymentMethod || "Credit Card",
        nextDueDate: (initialData.nextDueDate || todayStr()).slice(0, 10),
        status: initialData.status || "Active",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        billingCycle: "Monthly",
        category: "Entertainment & OTT",
        paymentMethod: "Credit Card",
        nextDueDate: todayStr(),
        status: "Active",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Please enter subscription name");
    if (!formData.amount || Number(formData.amount) <= 0) {
      return alert("Please enter a valid positive amount");
    }

    onSave({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? "✏️ Edit Subscription" : "🔁 New Recurring Subscription"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Subscription Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix Premium, Spotify, Airtel Wi-Fi, Gym"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                placeholder="e.g. 649"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Billing Frequency *</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

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

          <div className="form-row-2">
            <div className="form-group">
              <label>Next Due Date *</label>
              <input
                type="date"
                required
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">🟢 Active</option>
                <option value="Paused">⏸️ Paused</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes / Plan Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 4-screen sharing plan, student discount active"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initialData ? "Update Subscription" : "Save Subscription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
