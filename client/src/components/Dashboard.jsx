import { useMemo, useState } from "react";
import { CATEGORIES, formatINR, formatDate } from "../constants";

export default function Dashboard({
  items,
  budget,
  setBudget,
  onOpenNewTransaction,
  onOpenEditTransaction,
  onNavigate,
  onSeedData,
}) {
  const [hoveredCat, setHoveredCat] = useState(null);
  const [hoveredTrend, setHoveredTrend] = useState(null);

  // Aggregations
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const todayKey = now.toISOString().slice(0, 10);

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    let todayExpense = 0;

    const catMap = {};

    items.forEach((x) => {
      const amt = Number(x.amount) || 0;
      const isExp = x.type !== "income";
      const itemMonth = (x.date || "").slice(0, 7);
      const itemDate = (x.date || "").slice(0, 10);

      if (isExp) {
        totalExpense += amt;
        catMap[x.category] = (catMap[x.category] || 0) + amt;
        if (itemMonth === currentMonthKey) thisMonthExpense += amt;
        if (itemDate === todayKey) todayExpense += amt;
      } else {
        totalIncome += amt;
        if (itemMonth === currentMonthKey) thisMonthIncome += amt;
      }
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
    const daysInMonthSoFar = Math.max(1, now.getDate());
    const dailyAvg = Math.round(thisMonthExpense / daysInMonthSoFar);

    const budgetPct = budget > 0 ? Math.min(100, Math.round((thisMonthExpense / budget) * 100)) : 0;
    const isOverBudget = thisMonthExpense > budget;
    const budgetRemaining = Math.max(0, budget - thisMonthExpense);

    // Categories array sorted by spend
    const catList = Object.entries(catMap)
      .map(([name, val]) => ({
        name,
        val,
        pct: totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0,
        cfg: CATEGORIES[name] || CATEGORIES["Other & Misc"],
      }))
      .sort((a, b) => b.val - a.val);

    // Financial Health Score (0 - 100)
    let healthScore = 50;
    if (savingsRate >= 20) healthScore += 25;
    else if (savingsRate >= 10) healthScore += 15;
    if (!isOverBudget && budgetPct <= 85) healthScore += 25;
    else if (!isOverBudget) healthScore += 10;
    else healthScore -= 20;
    healthScore = Math.max(10, Math.min(100, healthScore));

    let healthLabel = "Excellent";
    let healthColor = "#10b981";
    if (healthScore < 50) {
      healthLabel = "Needs Attention";
      healthColor = "#ef4444";
    } else if (healthScore < 75) {
      healthLabel = "Good";
      healthColor = "#f59e0b";
    }

    // Monthly breakdown for last 6 months
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      monthlyData[k] = { key: k, label, expense: 0, income: 0 };
    }

    items.forEach((x) => {
      const k = (x.date || "").slice(0, 7);
      if (monthlyData[k]) {
        const amt = Number(x.amount) || 0;
        if (x.type === "income") monthlyData[k].income += amt;
        else monthlyData[k].expense += amt;
      }
    });

    const monthlyList = Object.values(monthlyData);
    const maxMonthlyExp = Math.max(100, ...monthlyList.map((m) => Math.max(m.expense, m.income)));

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      thisMonthExpense,
      thisMonthIncome,
      todayExpense,
      dailyAvg,
      budgetPct,
      isOverBudget,
      budgetRemaining,
      catList,
      healthScore,
      healthLabel,
      healthColor,
      monthlyList,
      maxMonthlyExp,
    };
  }, [items, budget]);

  // Donut conic gradient with smooth stops
  const donutGradient = useMemo(() => {
    if (!stats.catList.length || stats.totalExpense === 0) return "var(--border-color)";
    let acc = 0;
    const parts = stats.catList.map((s) => {
      const a1 = (acc / stats.totalExpense) * 360;
      acc += s.val;
      const a2 = (acc / stats.totalExpense) * 360;
      return `${s.cfg.color} ${a1}deg ${a2}deg`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }, [stats.catList, stats.totalExpense]);

  // Radial progress circumference for health gauge
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * stats.healthScore) / 100;

  // Recent 5 transactions
  const recent = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [items]);

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Hero Welcome Banner */}
      <section className="hero-banner card">
        <div className="hero-decor-orb-1"></div>
        <div className="hero-decor-orb-2"></div>
        <div className="hero-content">
          <div className="hero-title-group">
            <div className="hero-badge">✨ Smart Financial Cockpit</div>
            <h1>Good Day! Here is your Financial Summary</h1>
            <p className="hero-subtitle">
              Monitor real-time cashflow, track budget ceilings, and accelerate your savings goals.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-secondary glow-hover" onClick={() => onOpenNewTransaction("income")}>
              <span>+</span> Log Income
            </button>
            <button className="btn-primary glow-pulse" onClick={() => onOpenNewTransaction("expense")}>
              <span>+</span> Log Expense
            </button>
          </div>
        </div>
      </section>

      {/* Top 6 KPI Metric Cards */}
      <section className="kpi-grid">
        <div className="card kpi-card card-glow">
          <div className="kpi-header">
            <span className="kpi-title">Net Balance</span>
            <div className="kpi-icon-wrap balance">💰</div>
          </div>
          <div className={`kpi-value ${stats.netBalance >= 0 ? "positive" : "negative"}`}>
            {formatINR(stats.netBalance)}
          </div>
          <div className="kpi-footer-badge">
            <span className={`kpi-trend-pill ${stats.netBalance >= 0 ? "positive" : "negative"}`}>
              {stats.netBalance >= 0 ? "▲ Surplus Available" : "▼ In Deficit"}
            </span>
          </div>
        </div>

        <div className="card kpi-card card-glow">
          <div className="kpi-header">
            <span className="kpi-title">Total Inflow</span>
            <div className="kpi-icon-wrap income">💵</div>
          </div>
          <div className="kpi-value income-value">{formatINR(stats.totalIncome)}</div>
          <div className="kpi-footer-badge">
            <span className="kpi-trend-pill positive">Cumulative Earnings</span>
          </div>
        </div>

        <div className="card kpi-card card-glow">
          <div className="kpi-header">
            <span className="kpi-title">Total Outflow</span>
            <div className="kpi-icon-wrap expense">🛍️</div>
          </div>
          <div className="kpi-value expense-value">{formatINR(stats.totalExpense)}</div>
          <div className="kpi-footer-badge">
            <span className="kpi-trend-pill negative">All Logged Expenses</span>
          </div>
        </div>

        <div className="card kpi-card card-glow">
          <div className="kpi-header">
            <span className="kpi-title">Savings Rate</span>
            <div className="kpi-icon-wrap savings">📊</div>
          </div>
          <div className="kpi-value">{stats.savingsRate}%</div>
          <div className="kpi-mini-track">
            <div
              className="kpi-mini-fill"
              style={{
                width: `${Math.min(100, stats.savingsRate)}%`,
                background: stats.savingsRate >= 20 ? "#10b981" : "#f59e0b",
              }}
            ></div>
          </div>
          <span className="kpi-caption">Target Rule: &ge; 20%</span>
        </div>

        <div className="card kpi-card card-glow">
          <div className="kpi-header">
            <span className="kpi-title">This Month Spend</span>
            <div className="kpi-icon-wrap month">📅</div>
          </div>
          <div className="kpi-value">{formatINR(stats.thisMonthExpense)}</div>
          <div className="kpi-footer-badge">
            <span className={`kpi-trend-pill ${stats.isOverBudget ? "negative" : "neutral"}`}>
              {stats.isOverBudget
                ? `⚠️ Over by ${formatINR(stats.thisMonthExpense - budget)}`
                : `${formatINR(stats.budgetRemaining)} remaining`}
            </span>
          </div>
        </div>

        <div className="card kpi-card card-glow">
          <div className="kpi-header">
            <span className="kpi-title">Daily Average</span>
            <div className="kpi-icon-wrap avg">📈</div>
          </div>
          <div className="kpi-value">{formatINR(stats.dailyAvg)} <small className="unit">/ day</small></div>
          <div className="kpi-footer-badge">
            <span className="kpi-trend-pill neutral">Current Month Pace</span>
          </div>
        </div>
      </section>

      {/* Middle Row: Monthly Budget & Visual Financial Health Gauge */}
      <section className="grid-two-col">
        {/* Budget Status Card */}
        <div className="card budget-card card-glow">
          <div className="card-header-flex">
            <div>
              <div className="section-pretitle">SPENDING DISCIPLINE</div>
              <h3>Monthly Budget Allocation</h3>
              <p className="card-subtitle">Control and monitor your spending limit</p>
            </div>
            <div className="budget-input-wrap">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                min="500"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value) || 1000)}
                title="Click to edit monthly budget"
              />
            </div>
          </div>

          <div className="budget-progress-block">
            <div className="progress-labels">
              <span>Spent: <b>{formatINR(stats.thisMonthExpense)}</b></span>
              <span>Ceiling: <b>{formatINR(budget)}</b></span>
            </div>
            <div className="progress-bar-track large">
              <div
                className={`progress-bar-fill ${
                  stats.isOverBudget ? "danger" : stats.budgetPct >= 80 ? "warning" : "good"
                }`}
                style={{ width: `${Math.min(100, stats.budgetPct)}%` }}
              ></div>
            </div>
            <div className="progress-footer-stats">
              <span className={`status-tag ${stats.isOverBudget ? "danger" : stats.budgetPct >= 80 ? "warning" : "good"}`}>
                {stats.budgetPct}% Utilized
              </span>
              <span className="muted-text">
                {stats.isOverBudget
                  ? `Over limit by ${formatINR(stats.thisMonthExpense - budget)}`
                  : `${formatINR(stats.budgetRemaining)} safe buffer remaining`}
              </span>
            </div>
          </div>

          {/* Cashflow Inflow vs Outflow Split Bar */}
          <div className="cashflow-split">
            <div className="split-header-row">
              <h4>Total Cashflow Proportion</h4>
              <span className="split-ratio-text">
                {stats.totalIncome + stats.totalExpense > 0
                  ? `${Math.round((stats.totalIncome / (stats.totalIncome + stats.totalExpense)) * 100)}% In / ${Math.round((stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100)}% Out`
                  : "50% / 50%"}
              </span>
            </div>
            <div className="split-bar">
              <div
                className="split-bar-in"
                style={{
                  width: `${
                    stats.totalIncome + stats.totalExpense > 0
                      ? Math.round((stats.totalIncome / (stats.totalIncome + stats.totalExpense)) * 100)
                      : 50
                  }%`,
                }}
              ></div>
              <div
                className="split-bar-out"
                style={{
                  width: `${
                    stats.totalIncome + stats.totalExpense > 0
                      ? Math.round((stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100)
                      : 50
                  }%`,
                }}
              ></div>
            </div>
            <div className="split-labels">
              <span className="split-in-label">
                <span className="dot green"></span> Inflow: {formatINR(stats.totalIncome)}
              </span>
              <span className="split-out-label">
                <span className="dot red"></span> Outflow: {formatINR(stats.totalExpense)}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Health Score with Circular Radial SVG Gauge */}
        <div className="card health-card card-glow">
          <div className="card-header-flex">
            <div>
              <div className="section-pretitle">ALGORITHMIC SCORING</div>
              <h3>Financial Health Score</h3>
              <p className="card-subtitle">Real-time financial stability index</p>
            </div>
            <div
              className="health-badge"
              style={{
                background: `${stats.healthColor}18`,
                color: stats.healthColor,
                borderColor: `${stats.healthColor}40`,
              }}
            >
              {stats.healthLabel}
            </div>
          </div>

          {/* Radial SVG Gauge */}
          <div className="health-gauge-center">
            <div className="radial-gauge-container">
              <svg className="radial-gauge-svg" width="128" height="128" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  className="gauge-bg-ring"
                  cx="64"
                  cy="64"
                  r={radius}
                  strokeWidth="9"
                />
                {/* Progress Ring */}
                <circle
                  className="gauge-progress-ring"
                  cx="64"
                  cy="64"
                  r={radius}
                  strokeWidth="9"
                  stroke={stats.healthColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="gauge-center-content">
                <span className="health-score">{stats.healthScore}</span>
                <span className="health-max">out of 100</span>
              </div>
            </div>
          </div>

          <div className="health-insights-list">
            <div className="health-point">
              <span className="hp-icon">{stats.savingsRate >= 20 ? "✅" : "⚠️"}</span>
              <span className="hp-text">
                Savings rate at <b>{stats.savingsRate}%</b> {stats.savingsRate >= 20 ? "(Excellent)" : "(Target: 20%)"}
              </span>
            </div>
            <div className="health-point">
              <span className="hp-icon">{!stats.isOverBudget ? "✅" : "🚨"}</span>
              <span className="hp-text">
                {!stats.isOverBudget ? "Expenditures well within budget ceiling" : "Monthly budget threshold exceeded"}
              </span>
            </div>
            <div className="health-point">
              <span className="hp-icon">💡</span>
              <span className="hp-text">
                {stats.catList.length > 0
                  ? `Dominant expenditure: ${stats.catList[0].cfg.icon} ${stats.catList[0].name} (${stats.catList[0].pct}%)`
                  : "Add transactions to calculate spending dynamics"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section: Interactive Donut & 6-Month Historical Trends */}
      <section className="grid-two-col">
        {/* Category Expense Donut Chart */}
        <div className="card chart-card card-glow">
          <div className="card-header-flex">
            <div>
              <div className="section-pretitle">EXPENSE DISTRIBUTION</div>
              <h3>Spending by Category</h3>
              <p className="card-subtitle">Visual share across categories</p>
            </div>
            <button className="btn-ghost-sm" onClick={() => onNavigate("analytics")}>
              Full Breakdown &rarr;
            </button>
          </div>

          <div className="chart-flex-container">
            <div className="donut-wrap">
              <div className="donut-graphic" style={{ background: donutGradient }}>
                <div className="donut-core">
                  <span className="donut-core-amt">
                    {hoveredCat ? formatINR(hoveredCat.val) : formatINR(stats.totalExpense)}
                  </span>
                  <span className="donut-core-label">
                    {hoveredCat ? hoveredCat.name : "Total Outflow"}
                  </span>
                </div>
              </div>
            </div>

            <div className="chart-legend-grid">
              {stats.catList.slice(0, 6).map((cat) => (
                <div
                  key={cat.name}
                  className={`legend-item-chip ${hoveredCat?.name === cat.name ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredCat(cat)}
                  onMouseLeave={() => setHoveredCat(null)}
                >
                  <span className="legend-dot" style={{ background: cat.cfg.color }}></span>
                  <span className="legend-name">
                    {cat.cfg.icon} {cat.name}
                  </span>
                  <span className="legend-pct">{cat.pct}%</span>
                  <span className="legend-val">{formatINR(cat.val)}</span>
                </div>
              ))}
              {stats.catList.length === 0 && (
                <p className="muted-text text-center pad-md">No expenses recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* 6-Month Historical Trend Bar Chart */}
        <div className="card chart-card card-glow">
          <div className="card-header-flex">
            <div>
              <div className="section-pretitle">HISTORICAL ANALYSIS</div>
              <h3>6-Month Spending Trends</h3>
              <p className="card-subtitle">Income vs expense patterns</p>
            </div>
            <span className="muted-badge">Monthly Trajectory</span>
          </div>

          <div className="trend-chart-wrapper">
            {/* Horizontal Grid lines */}
            <div className="chart-grid-lines">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>

            <div className="monthly-trend-chart">
              {stats.monthlyList.map((m) => {
                const expHeight = stats.maxMonthlyExp > 0 ? (m.expense / stats.maxMonthlyExp) * 100 : 0;
                const incHeight = stats.maxMonthlyExp > 0 ? (m.income / stats.maxMonthlyExp) * 100 : 0;
                const isHovered = hoveredTrend === m.key;

                return (
                  <div
                    key={m.key}
                    className={`trend-col ${isHovered ? "active-col" : ""}`}
                    onMouseEnter={() => setHoveredTrend(m.key)}
                    onMouseLeave={() => setHoveredTrend(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="trend-hover-tooltip animate-slide-down">
                        <div>🟢 {formatINR(m.income)}</div>
                        <div>🔴 {formatINR(m.expense)}</div>
                      </div>
                    )}

                    <div className="trend-bars-pair">
                      <div
                        className="trend-bar income-bar"
                        style={{ height: `${Math.max(6, incHeight)}%` }}
                        title={`${m.label} Inflow: ${formatINR(m.income)}`}
                      ></div>
                      <div
                        className="trend-bar expense-bar"
                        style={{ height: `${Math.max(6, expHeight)}%` }}
                        title={`${m.label} Outflow: ${formatINR(m.expense)}`}
                      ></div>
                    </div>
                    <span className="trend-month-label">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="trend-chart-legend">
            <span className="trend-legend-item">
              <span className="trend-legend-dot inc"></span> Inflow
            </span>
            <span className="trend-legend-item">
              <span className="trend-legend-dot exp"></span> Outflow
            </span>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="card recent-activity-card card-glow">
        <div className="card-header-flex">
          <div>
            <div className="section-pretitle">TRANSACTION FEED</div>
            <h3>Recent Financial Activity</h3>
            <p className="card-subtitle">Quick view of latest logged records</p>
          </div>
          <button className="btn-secondary glow-hover" onClick={() => onNavigate("transactions")}>
            View All ({items.length}) &rarr;
          </button>
        </div>

        <div className="transaction-mini-list">
          {recent.map((tx) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES["Other & Misc"];
            const isInc = tx.type === "income";
            return (
              <div
                key={tx._id}
                className="transaction-mini-row"
                onClick={() => onOpenEditTransaction(tx)}
                title="Click to view or edit transaction"
              >
                <div className="tx-icon-box" style={{ background: cat.bg, color: cat.color }}>
                  {cat.icon}
                </div>

                <div className="tx-details">
                  <div className="tx-title-row">
                    <span className="tx-title">{tx.title}</span>
                    {tx.merchant && <span className="tx-merchant">@{tx.merchant}</span>}
                  </div>
                  <div className="tx-meta-row">
                    <span className="tx-cat">{tx.category}</span>
                    <span className="tx-dot">•</span>
                    <span className="tx-date">{formatDate(tx.date)}</span>
                    <span className="tx-dot">•</span>
                    <span className="tx-pm">{tx.paymentMethod || "UPI"}</span>
                  </div>
                </div>

                <div className="tx-right">
                  <span className={`tx-amt ${isInc ? "income" : "expense"}`}>
                    {isInc ? "+" : "-"}{formatINR(tx.amount)}
                  </span>
                  <span className={`tx-status-pill ${tx.status === "Pending" ? "pending" : "completed"}`}>
                    {tx.status || "Completed"}
                  </span>
                </div>
              </div>
            );
          })}

          {recent.length === 0 && (
            <div className="empty-state">
              <p>🕊️ No transactions found yet.</p>
              <button className="btn-primary" onClick={() => onOpenNewTransaction("expense")}>
                Add Your First Transaction
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
