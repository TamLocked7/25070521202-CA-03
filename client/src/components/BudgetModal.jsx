import { useState, useEffect } from "react";
import { CATEGORIES } from "../constants";

export default function BudgetModal({ isOpen, onClose, categoryBudgets, onSave }) {
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    setBudgets({ ...categoryBudgets });
  }, [categoryBudgets, isOpen]);

  if (!isOpen) return null;

  const handleChange = (cat, val) => {
    setBudgets((prev) => ({
      ...prev,
      [cat]: Math.max(0, Number(val) || 0),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(budgets);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚙️ Manage Category Budget Limits</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="card-subtitle">
            Configure individual monthly spending limits for each category to trigger warnings when near thresholds.
          </p>

          <div className="budget-edit-list">
            {Object.keys(CATEGORIES).map((catName) => {
              const cfg = CATEGORIES[catName];
              const curVal = budgets[catName] !== undefined ? budgets[catName] : 0;
              return (
                <div key={catName} className="budget-edit-row">
                  <div className="budget-edit-label">
                    <span className="cat-icon-sm" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </span>
                    <b>{catName}</b>
                  </div>
                  <div className="budget-edit-input-wrap">
                    <span className="cur-sym">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={curVal}
                      onChange={(e) => handleChange(catName, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Budget Limits
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
