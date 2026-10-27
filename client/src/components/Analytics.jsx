import { useMemo } from "react";
import { CATEGORIES, PAYMENT_METHODS, formatINR } from "../constants";

export default function Analytics({ items }) {
  // Category breakdown
  const categoryStats = useMemo(() => {
    const totalExp = items
      .filter((x) => x.type !== "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);

    const map = {};
    items
      .filter((x) => x.type !== "income")
      .forEach((x) => {
        const cat = x.category || "Other & Misc";
        const amt = Number(x.amount) || 0;
        if (!map[cat]) {
          map[cat] = { name: cat, total: 0, count: 0, cfg: CATEGORIES[cat] || CATEGORIES["Other & Misc"] };
        }
        map[cat].total += amt;
        map[cat].count += 1;
      });

    return Object.values(map)
      .map((item) => ({
        ...item,
        pct: totalExp > 0 ? Math.round((item.total / totalExp) * 100) : 0,
        avg: item.count > 0 ? Math.round(item.total / item.count) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [items]);

  // Payment method breakdown
  const paymentStats = useMemo(() => {
    const totalExp = items
      .filter((x) => x.type !== "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);

    const map = {};
    PAYMENT_METHODS.forEach((pm) => {
      map[pm.id] = { id: pm.id, name: pm.name, icon: pm.icon, total: 0, count: 0 };
    });

    items
      .filter((x) => x.type !== "income")
      .forEach((x) => {
        const pm = x.paymentMethod || "UPI";
        if (!map[pm]) {
          map[pm] = { id: pm, name: pm, icon: "💳", total: 0, count: 0 };
        }
        map[pm].total += Number(x.amount) || 0;
        map[pm].count += 1;
      });

    return Object.values(map)
      .filter((p) => p.count > 0)
      .map((p) => ({
        ...p,
        pct: totalExp > 0 ? Math.round((p.total / totalExp) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [items]);

  // Monthly cashflow history
  const monthlyFlow = useMemo(() => {
    const map = {};
    items.forEach((x) => {
      const monthKey = (x.date || "").slice(0, 7);
      if (!monthKey) return;
      if (!map[monthKey]) {
        map[monthKey] = { monthKey, income: 0, expense: 0 };
      }
      const amt = Number(x.amount) || 0;
      if (x.type === "income") map[monthKey].income += amt;
      else map[monthKey].expense += amt;
    });

    const sorted = Object.values(map).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    return sorted.map((m) => {
      const dateObj = new Date(m.monthKey + "-01");
      const label = dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const net = m.income - m.expense;
      return {
        ...m,
        label,
        net,
      };
    });
  }, [items]);

  // Top spending merchants
  const topMerchants = useMemo(() => {
    const map = {};
    items
      .filter((x) => x.type !== "income" && x.merchant && x.merchant.trim())
      .forEach((x) => {
        const m = x.merchant.trim();
        if (!map[m]) map[m] = { name: m, total: 0, count: 0 };
        map[m].total += Number(x.amount) || 0;
        map[m].count += 1;
      });

    const totalMerchantExp = Object.values(map).reduce((s, m) => s + m.total, 0);

    return Object.values(map)
      .map((m) => ({
        ...m,
        pct: totalMerchantExp > 0 ? Math.round((m.total / totalMerchantExp) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [items]);

  // Smart AI-like Financial Insights
  const insights = useMemo(() => {
    const list = [];
    const totalExp = items
      .filter((x) => x.type !== "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
    const totalInc = items
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);

    // Insight 1: Savings rate
    if (totalInc > 0) {
      const rate = Math.round(((totalInc - totalExp) / totalInc) * 100);
      if (rate >= 20) {
        list.push({
          type: "success",
          icon: "🌟",
          title: "Healthy Savings Momentum",
          desc: `You are currently saving ${rate}% of total income, well within the golden 50/30/20 personal finance rule!`,
        });
      } else if (rate > 0) {
        list.push({
          type: "warning",
          icon: "⚠️",
          title: "Moderate Savings Buffer",
          desc: `Your savings rate is ${rate}%. Consider curbing non-essential dining and shopping to push towards the 20% benchmark.`,
        });
      } else {
        list.push({
          type: "danger",
          icon: "🚨",
          title: "Deficit Spending Alert",
          desc: "Your overall expenditures exceed your logged income. Look into high-ticket expenses to balance cashflow.",
        });
      }
    }

    // Insight 2: Top category concentration
    if (categoryStats.length > 0) {
      const top = categoryStats[0];
      if (top.pct >= 30) {
        list.push({
          type: "info",
          icon: "💡",
          title: `High Spending in ${top.name}`,
          desc: `${top.name} represents ${top.pct}% (${formatINR(top.total)}) of your total spending. Setting a category budget limit can help save up to 15%.`,
        });
      }
    }

    // Insight 3: Payment method preference
    if (paymentStats.length > 0) {
      const topPm = paymentStats[0];
      list.push({
        type: "info",
        icon: "💳",
        title: `Primary Channel: ${topPm.name}`,
        desc: `You execute ${topPm.pct}% of your payments via ${topPm.name} across ${topPm.count} transactions.`,
      });
    }

    // Insight 4: Average ticket size
    const expCount = items.filter((x) => x.type !== "income").length;
    if (expCount > 0 && totalExp > 0) {
      const avgTicket = Math.round(totalExp / expCount);
      list.push({
        type: "tip",
        icon: "🎯",
        title: "Average Transaction Size",
        desc: `Your average expense size is ${formatINR(avgTicket)} across ${expCount} logged expense transactions.`,
      });
    }

    return list;
  }, [items, categoryStats, paymentStats]);

  const maxMonthValue = useMemo(() => {
    return Math.max(
      100,
      ...monthlyFlow.map((m) => Math.max(m.income, m.expense))
    );
  }, [monthlyFlow]);

  return (
    <div className="analytics-page animate-fade-in">
      {/* Header Banner */}
      <div className="page-header card card-glow">
        <div className="page-header-info">
          <div className="section-pretitle">DEEP INTELLIGENCE & PATTERNS</div>
          <h2>Financial Analytics & Intelligence 📈</h2>
          <p className="card-subtitle">
            Deep dive into expense distributions, payment methods, cashflow trends, and smart saving recommendations
          </p>
        </div>
      </div>

      {/* Smart Automated Financial Insights Grid */}
      <section className="insights-section">
        <h3>Smart Financial Insights & Advisory 🤖</h3>
        <div className="insights-grid">
          {insights.map((ins, idx) => (
            <div key={idx} className={`card insight-card ${ins.type}`}>
              <div className="insight-icon">{ins.icon}</div>
              <div className="insight-body">
                <h4>{ins.title}</h4>
                <p>{ins.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid: Category Progress Bars & Payment Method Share */}
      <section className="grid-two-col">
        {/* Category Breakdown Table & Bars */}
        <div className="card analytics-card">
          <div className="card-header-flex">
            <div>
              <h3>Category-Wise Expenditure</h3>
              <p className="card-subtitle">Detailed breakdown by expenditure type</p>
            </div>
            <span className="muted-badge">{categoryStats.length} Categories</span>
          </div>

          <div className="category-bars-list">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="cat-stat-row">
                <div className="cat-stat-header">
                  <span className="cat-stat-name">
                    {cat.cfg.icon} <b>{cat.name}</b>
                    <small className="muted-text"> ({cat.count} txs · avg {formatINR(cat.avg)})</small>
                  </span>
                  <span className="cat-stat-amt">
                    {formatINR(cat.total)}{" "}
                    <span className="cat-stat-pct">({cat.pct}%)</span>
                  </span>
                </div>
                <div className="cat-progress-track">
                  <div
                    className="cat-progress-fill"
                    style={{
                      width: `${cat.pct}%`,
                      background: cat.cfg.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}

            {categoryStats.length === 0 && (
              <p className="muted-text text-center">No expense records available.</p>
            )}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="card analytics-card">
          <div className="card-header-flex">
            <div>
              <h3>Payment Method Distribution</h3>
              <p className="card-subtitle">Where your money flows from</p>
            </div>
            <span className="muted-badge">{paymentStats.length} Channels</span>
          </div>

          <div className="pm-stats-list">
            {paymentStats.map((pm) => (
              <div key={pm.id} className="pm-stat-card">
                <div className="pm-stat-top">
                  <div className="pm-title-group">
                    <span className="pm-emoji">{pm.icon}</span>
                    <span className="pm-name"><b>{pm.id}</b></span>
                  </div>
                  <div className="pm-amt-group">
                    <b>{formatINR(pm.total)}</b>
                    <span className="pm-badge">{pm.pct}%</span>
                  </div>
                </div>
                <div className="pm-progress-track">
                  <div
                    className="pm-progress-fill"
                    style={{ width: `${pm.pct}%` }}
                  ></div>
                </div>
                <div className="pm-stat-footer">
                  <small className="muted-text">{pm.count} total transactions</small>
                </div>
              </div>
            ))}

            {paymentStats.length === 0 && (
              <p className="muted-text text-center">No payment data recorded yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Row 2: Monthly Cashflow History & Top Merchants */}
      <section className="grid-two-col">
        {/* Monthly Cashflow History Table / Chart */}
        <div className="card analytics-card">
          <div className="card-header-flex">
            <div>
              <h3>Monthly Cashflow Trajectory</h3>
              <p className="card-subtitle">Inflow vs outflow balance by month</p>
            </div>
          </div>

          <div className="monthly-flow-bars">
            {monthlyFlow.map((m) => {
              const incH = maxMonthValue > 0 ? (m.income / maxMonthValue) * 100 : 0;
              const expH = maxMonthValue > 0 ? (m.expense / maxMonthValue) * 100 : 0;
              return (
                <div key={m.monthKey} className="flow-month-col">
                  <div className="flow-bars-stack">
                    <div
                      className="flow-bar inc"
                      style={{ height: `${Math.max(5, incH)}%` }}
                      title={`${m.label} Income: ${formatINR(m.income)}`}
                    ></div>
                    <div
                      className="flow-bar exp"
                      style={{ height: `${Math.max(5, expH)}%` }}
                      title={`${m.label} Expense: ${formatINR(m.expense)}`}
                    ></div>
                  </div>
                  <span className="flow-label">{m.label}</span>
                  <span className={`flow-net ${m.net >= 0 ? "positive" : "negative"}`}>
                    {m.net >= 0 ? "+" : ""}{formatINR(m.net)}
                  </span>
                </div>
              );
            })}

            {monthlyFlow.length === 0 && (
              <p className="muted-text text-center">No historical monthly data recorded.</p>
            )}
          </div>

          <div className="trend-chart-legend">
            <span className="trend-legend-item">
              <span className="trend-legend-dot inc"></span> Total Inflow
            </span>
            <span className="trend-legend-item">
              <span className="trend-legend-dot exp"></span> Total Outflow
            </span>
          </div>
        </div>

        {/* Top Spending Merchants */}
        <div className="card analytics-card">
          <div className="card-header-flex">
            <div>
              <h3>Top Spending Merchants & Payees</h3>
              <p className="card-subtitle">Where you spend the most often</p>
            </div>
            <span className="muted-badge">Top 6</span>
          </div>

          <div className="merchants-list">
            {topMerchants.map((m, idx) => (
              <div key={m.name} className="merchant-row">
                <div className="merchant-rank">#{idx + 1}</div>
                <div className="merchant-info">
                  <div className="merchant-name-row">
                    <b>@{m.name}</b>
                    <span>{formatINR(m.total)}</span>
                  </div>
                  <div className="merchant-progress-track">
                    <div
                      className="merchant-progress-fill"
                      style={{ width: `${m.pct}%` }}
                    ></div>
                  </div>
                  <div className="merchant-sub-row">
                    <small className="muted-text">{m.count} visits / purchases</small>
                    <small className="muted-text">{m.pct}% of merchant spend</small>
                  </div>
                </div>
              </div>
            ))}

            {topMerchants.length === 0 && (
              <p className="muted-text text-center">
                No merchant names recorded yet. Use the `@merchant` field when adding transactions!
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
