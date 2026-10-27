export default function Navbar({
  activeTab,
  setActiveTab,
  dark,
  setDark,
  colorTheme = "emerald",
  setColorTheme,
  serverStatus,
  onOpenNewTransaction,
  rollNo = "25070521202",
}) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "transactions", label: "Transactions", icon: "💳" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "budgets", label: "Budgets & Goals", icon: "🎯" },
    { id: "subscriptions", label: "Recurring Bills", icon: "🔁" },
    { id: "reports", label: "Reports & Project Info", icon: "📑" },
  ];

  const themes = [
    { id: "emerald", label: "Emerald Wealth", color: "#10b981", icon: "🟢" },
    { id: "violet", label: "Electric Violet", color: "#6366f1", icon: "🟣" },
    { id: "sapphire", label: "Sapphire Fintech", color: "#2563eb", icon: "🔵" },
    { id: "amber", label: "Sunset Amber", color: "#f59e0b", icon: "🟠" },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Brand */}
          <div className="nav-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="brand-logo-glow">
              <span className="brand-logo-icon">💰</span>
            </div>
            <div className="brand-text">
              <h2>SpendWise</h2>
              <span className="brand-tag">MERN Finance</span>
            </div>
          </div>

          {/* Tab Pills */}
          <div className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="nav-actions">
            {/* Color Palette Switcher */}
            <div className="palette-picker" title="Change App Color Scheme">
              {themes.map((th) => (
                <button
                  key={th.id}
                  className={`palette-dot-btn ${colorTheme === th.id ? "active" : ""}`}
                  style={{ background: th.color }}
                  onClick={() => setColorTheme(th.id)}
                  title={`Switch to ${th.label}`}
                  aria-label={th.label}
                >
                  {colorTheme === th.id && <span className="palette-check">✓</span>}
                </button>
              ))}
            </div>

            {/* Connection Status Indicator */}
            <div
              className={`status-pill ${serverStatus.online ? (serverStatus.db ? "online" : "warning") : "offline"}`}
              title={
                serverStatus.online
                  ? serverStatus.db
                    ? "Connected to Live MongoDB Database"
                    : "Connected to Express Server (DB connecting/fallback)"
                  : "Offline Demo Mode (Local Storage Synced)"
              }
            >
              <span className="status-beacon">
                <span className="beacon-core"></span>
                <span className="beacon-ripple"></span>
              </span>
              <span className="status-text">
                {serverStatus.online
                  ? serverStatus.db
                    ? "MongoDB Live"
                    : "Server Active"
                  : "Demo Mode"}
              </span>
            </div>

            {/* Student Roll Badge */}
            <div className="student-badge" title="Academic Roll Number">
              <span className="badge-cap">🎓</span>
              <span className="badge-roll">{rollNo}</span>
            </div>

            {/* Dark Mode Switch */}
            <button
              className={`theme-toggle ${dark ? "active" : ""}`}
              onClick={() => setDark(!dark)}
              title={dark ? "Dark Mode is ON (Click to toggle)" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              <span className="theme-toggle-icon">{dark ? "🌙" : "☀️"}</span>
            </button>

            {/* Quick Add Button */}
            <button className="btn-primary add-btn glow-pulse" onClick={onOpenNewTransaction}>
              <span className="add-plus-icon">+</span>
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Native Mobile Bottom Navigation Dock */}
      <aside className="mobile-bottom-nav" aria-label="Mobile Navigation Dock">
        <button
          className={`mobile-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
          aria-label="Dashboard"
        >
          <span className="mobile-nav-icon">📊</span>
          <span className="mobile-nav-label">Home</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
          aria-label="Transactions"
        >
          <span className="mobile-nav-icon">💳</span>
          <span className="mobile-nav-label">Logs</span>
        </button>

        {/* Floating Quick Action Button in Center */}
        <button
          className="mobile-nav-fab glow-pulse"
          onClick={onOpenNewTransaction}
          title="Quick Add Transaction"
          aria-label="Add Transaction"
        >
          <span className="mobile-fab-icon">+</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
          aria-label="Analytics"
        >
          <span className="mobile-nav-icon">📈</span>
          <span className="mobile-nav-label">Stats</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === "budgets" || activeTab === "subscriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("budgets")}
          aria-label="Budgets and Goals"
        >
          <span className="mobile-nav-icon">🎯</span>
          <span className="mobile-nav-label">Budgets</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
          aria-label="Reports & Info"
        >
          <span className="mobile-nav-icon">📑</span>
          <span className="mobile-nav-label">Info</span>
        </button>
      </aside>
    </>
  );
}
