import { useMemo, useState } from "react";
import { CATEGORIES, formatINR, formatDate } from "../constants";

export default function BudgetsGoals({
  items,
  monthlyBudget,
  setMonthlyBudget,
  categoryBudgets,
  onOpenBudgetModal,
  goals,
  onOpenNewGoal,
  onOpenEditGoal,
  onDeleteGoal,
  onAdjustGoal,
}) {
  const [selectedGoalForAdjust, setSelectedGoalForAdjust] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState("deposit"); // 'deposit' or 'withdraw'

  // Current month spent by category
  const thisMonthCategorySpend = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const map = {};
    items
      .filter((x) => x.type !== "income" && (x.date || "").startsWith(currentMonthPrefix))
      .forEach((x) => {
        const cat = x.category || "Other & Misc";
        map[cat] = (map[cat] || 0) + (Number(x.amount) || 0);
      });
    return map;
  }, [items]);

  const totalThisMonthSpent = useMemo(() => {
    return Object.values(thisMonthCategorySpend).reduce((s, v) => s + v, 0);
  }, [thisMonthCategorySpend]);

  const overallBudgetPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalThisMonthSpent / monthlyBudget) * 100)) : 0;
  const isOverallOver = totalThisMonthSpent > monthlyBudget;

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedGoalForAdjust) return;
    const val = Number(adjustAmount);
    if (!val || val <= 0) return;
    const delta = adjustType === "deposit" ? val : -val;
    onAdjustGoal(selectedGoalForAdjust._id, delta);
    setSelectedGoalForAdjust(null);
    setAdjustAmount("");
  };

  return (
    <div className="budgets-goals-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header card card-glow">
        <div className="page-header-info">
          <div className="section-pretitle">TARGETS & DISCIPLINE</div>
          <h2>Budgets & Savings Goals 🎯</h2>
          <p className="card-subtitle">
            Establish disciplined spending thresholds and track target savings milestones
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={onOpenBudgetModal}>
            <span>⚙️</span> Manage Category Limits
          </button>
          <button className="btn-primary" onClick={onOpenNewGoal}>
            <span>+</span> Create Savings Goal
          </button>
        </div>
      </div>

      {/* SECTION 1: Overall Monthly Budget */}
      <section className="card monthly-budget-master">
        <div className="card-header-flex">
          <div>
            <h3>Overall Monthly Spending Ceiling</h3>
            <p className="card-subtitle">Master threshold across all expenditure categories</p>
          </div>
          <div className="budget-input-wrap">
            <span className="currency-prefix">₹</span>
            <input
              type="number"
              min="1000"
              step="500"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value) || 1000)}
              title="Set master monthly limit"
            />
          </div>
        </div>

        <div className="master-budget-body">
          <div className="master-budget-stats">
            <div>
              <span className="muted-text">Spent This Month</span>
              <div className="stat-big-num">{formatINR(totalThisMonthSpent)}</div>
            </div>
            <div>
              <span className="muted-text">Monthly Ceiling</span>
              <div className="stat-big-num">{formatINR(monthlyBudget)}</div>
            </div>
            <div>
              <span className="muted-text">Remaining Balance</span>
              <div className={`stat-big-num ${isOverallOver ? "negative" : "positive"}`}>
                {isOverallOver
                  ? `-${formatINR(totalThisMonthSpent - monthlyBudget)}`
                  : formatINR(monthlyBudget - totalThisMonthSpent)}
              </div>
            </div>
          </div>

          <div className="progress-bar-track large">
            <div
              className={`progress-bar-fill ${
                isOverallOver ? "danger" : overallBudgetPct >= 80 ? "warning" : "good"
              }`}
              style={{ width: `${Math.min(100, overallBudgetPct)}%` }}
            ></div>
          </div>

          <div className="master-budget-status-row">
            <span className={`status-tag ${isOverallOver ? "danger" : overallBudgetPct >= 80 ? "warning" : "good"}`}>
              {overallBudgetPct}% Utilized
            </span>
            <span className="muted-text">
              {isOverallOver
                ? `⚠️ Spending exceeded by ${formatINR(totalThisMonthSpent - monthlyBudget)}`
                : `${formatINR(monthlyBudget - totalThisMonthSpent)} buffer remaining for this month`}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Category-Specific Budgets */}
      <section className="category-budgets-section">
        <div className="section-title-flex">
          <div>
            <h3>Category Spending Allocations</h3>
            <p className="section-subtitle">Dedicated monthly allowances per category</p>
          </div>
          <button className="btn-ghost-sm" onClick={onOpenBudgetModal}>
            + Add / Edit Category Limit
          </button>
        </div>

        <div className="category-budgets-grid">
          {Object.entries(categoryBudgets).map(([catName, limit]) => {
            const spent = thisMonthCategorySpend[catName] || 0;
            const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const isOver = spent > limit;
            const cfg = CATEGORIES[catName] || CATEGORIES["Other & Misc"];

            return (
              <div key={catName} className="card cat-budget-card">
                <div className="cat-budget-header">
                  <div className="cat-budget-title">
                    <span className="cat-icon-lg" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </span>
                    <div>
                      <b>{catName}</b>
                      <small className="muted-text block">Monthly Limit: {formatINR(limit)}</small>
                    </div>
                  </div>
                  <span className={`budget-status-pill ${isOver ? "danger" : pct >= 80 ? "warning" : "normal"}`}>
                    {isOver ? "Exceeded" : `${pct}%`}
                  </span>
                </div>

                <div className="cat-budget-body">
                  <div className="cat-budget-amounts">
                    <span>Spent: <b>{formatINR(spent)}</b></span>
                    <span>
                      {isOver ? (
                        <span className="danger-text">Over: +{formatINR(spent - limit)}</span>
                      ) : (
                        <span className="positive-text">Left: {formatINR(limit - spent)}</span>
                      )}
                    </span>
                  </div>

                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${isOver ? "danger" : pct >= 80 ? "warning" : "good"}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Savings Goals Tracker */}
      <section className="goals-section">
        <div className="section-title-flex">
          <div>
            <h3>Target Savings & Sinking Funds 🎯</h3>
            <p className="section-subtitle">Track targets with visual progress and live deposits</p>
          </div>
          <button className="btn-primary" onClick={onOpenNewGoal}>
            + New Savings Goal
          </button>
        </div>

        <div className="goals-grid">
          {goals.map((goal) => {
            const current = Number(goal.currentAmount) || 0;
            const target = Number(goal.targetAmount) || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;

            // Days remaining calculation
            let daysRemainingText = "No deadline";
            if (goal.deadline) {
              const diffMs = new Date(goal.deadline) - new Date();
              const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              if (days < 0) daysRemainingText = "Past deadline";
              else if (days === 0) daysRemainingText = "Due today!";
              else daysRemainingText = `${days} days left`;
            }

            return (
              <div
                key={goal._id}
                className="card goal-card"
                style={{ borderTop: `4px solid ${goal.color || "#6366f1"}` }}
              >
                <div className="goal-header">
                  <div>
                    <h4 className="goal-title">{goal.title}</h4>
                    <span className="goal-cat-tag">🏷️ {goal.category || "Savings"}</span>
                  </div>
                  <div className="goal-actions">
                    <button
                      className="row-action-btn"
                      title="Edit Goal"
                      onClick={() => onOpenEditGoal(goal)}
                    >
                      ✏️
                    </button>
                    <button
                      className="row-action-btn delete"
                      title="Delete Goal"
                      onClick={() => onDeleteGoal(goal._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="goal-amounts-row">
                  <div>
                    <span className="muted-text">Saved</span>
                    <div className="goal-amt-current">{formatINR(current)}</div>
                  </div>
                  <div className="text-right">
                    <span className="muted-text">Target</span>
                    <div className="goal-amt-target">{formatINR(target)}</div>
                  </div>
                </div>

                <div className="progress-bar-track large">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: goal.color || "var(--accent-gradient)",
                    }}
                  ></div>
                </div>

                <div className="goal-footer">
                  <span className="goal-pct-tag">
                    {isCompleted ? "🎉 Goal Achieved!" : `${pct}% completed`}
                  </span>
                  <span className="goal-deadline-tag">
                    📅 {daysRemainingText}
                  </span>
                </div>

                {/* Quick Deposit / Withdraw Buttons */}
                <div className="goal-quick-actions">
                  <button
                    className="btn-ghost-sm"
                    onClick={() => {
                      setSelectedGoalForAdjust(goal);
                      setAdjustType("deposit");
                      setAdjustAmount("1000");
                    }}
                  >
                    + Deposit Funds
                  </button>
                  <button
                    className="btn-ghost-sm"
                    onClick={() => {
                      setSelectedGoalForAdjust(goal);
                      setAdjustType("withdraw");
                      setAdjustAmount("500");
                    }}
                  >
                    - Withdraw
                  </button>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="empty-state">
              <p>🎯 No savings goals yet. Create one to build wealth & emergency funds!</p>
              <button className="btn-primary" onClick={onOpenNewGoal}>
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Adjust Goal Modal (Deposit / Withdraw) */}
      {selectedGoalForAdjust && (
        <div className="modal-overlay" onClick={() => setSelectedGoalForAdjust(null)}>
          <div className="card modal-content sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {adjustType === "deposit" ? "💰 Deposit to Goal" : "💸 Withdraw from Goal"}
              </h3>
              <button className="close-btn" onClick={() => setSelectedGoalForAdjust(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="modal-form">
              <p className="muted-text">
                Goal: <b>{selectedGoalForAdjust.title}</b> (Currently: {formatINR(selectedGoalForAdjust.currentAmount)})
              </p>

              <div className="form-group">
                <label>Amount (₹):</label>
                <input
                  type="number"
                  min="1"
                  required
                  autoFocus
                  placeholder="e.g. 1000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div className="quick-amount-chips">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="chip-btn"
                    onClick={() => setAdjustAmount(String(amt))}
                  >
                    +{formatINR(amt)}
                  </button>
                ))}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedGoalForAdjust(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm {adjustType === "deposit" ? "Deposit" : "Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
