import { useMemo } from "react";
import { formatINR, formatDate, CATEGORIES } from "../constants";

export default function Subscriptions({
  subscriptions,
  onOpenNewSub,
  onOpenEditSub,
  onToggleStatus,
  onDeleteSub,
}) {
  // Aggregate commitments
  const { totalMonthlyCommitment, activeCount, pausedCount } = useMemo(() => {
    let total = 0;
    let active = 0;
    let paused = 0;

    subscriptions.forEach((s) => {
      if (s.status === "Active") {
        active++;
        const amt = Number(s.amount) || 0;
        if (s.billingCycle === "Yearly") total += Math.round(amt / 12);
        else if (s.billingCycle === "Weekly") total += Math.round(amt * 4.33);
        else total += amt;
      } else {
        paused++;
      }
    });

    return {
      totalMonthlyCommitment: total,
      activeCount: active,
      pausedCount: paused,
    };
  }, [subscriptions]);

  return (
    <div className="subscriptions-page animate-fade-in">
      {/* Header */}
      <div className="page-header card card-glow">
        <div className="page-header-info">
          <div className="section-pretitle">RECURRING COMMITMENTS</div>
          <h2>Recurring Bills & Subscriptions 🔁</h2>
          <p className="card-subtitle">
            Track and control monthly recurring commitments, SaaS tools, and utilities
          </p>
        </div>
        <button className="btn-primary glow-pulse" onClick={onOpenNewSub}>
          <span>+</span> Add Subscription
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card card-glow">
          <span className="kpi-title">Monthly Fixed Burden</span>
          <div className="kpi-value expense-value">{formatINR(totalMonthlyCommitment)}</div>
          <span className="kpi-caption">Normalized monthly overhead</span>
        </div>
        <div className="card kpi-card card-glow">
          <span className="kpi-title">Active Subscriptions</span>
          <div className="kpi-value">{activeCount}</div>
          <span className="kpi-caption">Currently renewing</span>
        </div>
        <div className="card kpi-card card-glow">
          <span className="kpi-title">Paused / Inactive</span>
          <div className="kpi-value muted-text">{pausedCount}</div>
          <span className="kpi-caption">Temporarily suspended</span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="subs-grid">
        {subscriptions.map((sub) => {
          const cat = CATEGORIES[sub.category] || CATEGORIES["Other & Misc"];
          const isActive = sub.status === "Active";

          let countdownText = "Due soon";
          if (sub.nextDueDate) {
            const diff = new Date(sub.nextDueDate) - new Date();
            const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
            if (days < 0) countdownText = "⚠️ Overdue";
            else if (days === 0) countdownText = "🚨 Due Today!";
            else if (days === 1) countdownText = "⏰ Due Tomorrow";
            else countdownText = `⏳ Due in ${days} days`;
          }

          return (
            <div
              key={sub._id}
              className={`card sub-card ${!isActive ? "paused" : ""}`}
            >
              <div className="sub-card-header">
                <div className="sub-icon-box" style={{ background: cat.bg, color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="sub-header-details">
                  <h4 className="sub-title">{sub.name}</h4>
                  <span className="sub-cycle-badge">
                    {sub.billingCycle} • {sub.category}
                  </span>
                </div>
                <div className="sub-actions">
                  <button
                    className="row-action-btn"
                    title="Edit Subscription"
                    onClick={() => onOpenEditSub(sub)}
                  >
                    ✏️
                  </button>
                  <button
                    className="row-action-btn delete"
                    title="Delete"
                    onClick={() => onDeleteSub(sub._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="sub-amt-row">
                <span className="sub-amt">{formatINR(sub.amount)}</span>
                <span className="sub-amt-sub">/ {sub.billingCycle.toLowerCase()}</span>
              </div>

              {sub.notes && <p className="sub-notes">{sub.notes}</p>}

              <div className="sub-due-row">
                <span className="sub-due-label">Next Renewal:</span>
                <span className="sub-due-date">{formatDate(sub.nextDueDate)}</span>
                <span className="sub-due-tag">{countdownText}</span>
              </div>

              <div className="sub-footer-row">
                <span className="sub-pm-tag">💳 {sub.paymentMethod || "Credit Card"}</span>
                <button
                  className={`sub-status-toggle ${isActive ? "active" : "paused"}`}
                  onClick={() => onToggleStatus(sub._id)}
                  title="Click to toggle Active / Paused state"
                >
                  {isActive ? "🟢 Active (Pause?)" : "⏸️ Paused (Resume?)"}
                </button>
              </div>
            </div>
          );
        })}

        {subscriptions.length === 0 && (
          <div className="empty-state">
            <p>🔁 No recurring subscriptions added yet.</p>
            <button className="btn-primary" onClick={onOpenNewSub}>
              Add Subscription / Bill
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
