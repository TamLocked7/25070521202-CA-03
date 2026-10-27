import { useState, useMemo } from "react";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  STATUS_OPTIONS,
  formatINR,
  formatDate,
} from "../constants";

export default function Transactions({
  items,
  onOpenNewTransaction,
  onOpenEditTransaction,
  onDeleteTransaction,
  onBulkDelete,
  onDuplicateTransaction,
  notify,
}) {
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [datePreset, setDatePreset] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter logic
  const filteredItems = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return items.filter((x) => {
      // Type
      if (typeFilter !== "All" && x.type !== typeFilter.toLowerCase()) return false;

      // Category
      if (categoryFilter !== "All" && x.category !== categoryFilter) return false;

      // Payment method
      if (paymentFilter !== "All" && x.paymentMethod !== paymentFilter) return false;

      // Status
      if (statusFilter !== "All" && (x.status || "Completed") !== statusFilter) return false;

      // Date Presets
      const xDate = (x.date || "").slice(0, 10);
      if (datePreset === "today" && xDate !== todayStr) return false;

      if (datePreset === "thisWeek") {
        const d = new Date();
        const firstDayOfWeek = new Date(d.setDate(d.getDate() - d.getDay()));
        const firstDayStr = firstDayOfWeek.toISOString().slice(0, 10);
        if (xDate < firstDayStr || xDate > todayStr) return false;
      }

      if (datePreset === "thisMonth") {
        const monthPrefix = todayStr.slice(0, 7);
        if (!xDate.startsWith(monthPrefix)) return false;
      }

      if (datePreset === "lastMonth") {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevPrefix = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
        if (!xDate.startsWith(prevPrefix)) return false;
      }

      if (datePreset === "custom") {
        if (customStartDate && xDate < customStartDate) return false;
        if (customEndDate && xDate > customEndDate) return false;
      }

      // Keyword search (title, merchant, notes, tags)
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = (x.title || "").toLowerCase().includes(q);
        const inMerchant = (x.merchant || "").toLowerCase().includes(q);
        const inNotes = (x.notes || "").toLowerCase().includes(q);
        const inCategory = (x.category || "").toLowerCase().includes(q);
        const inTags = Array.isArray(x.tags) && x.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inMerchant && !inNotes && !inCategory && !inTags) return false;
      }

      return true;
    });
  }, [
    items,
    search,
    typeFilter,
    categoryFilter,
    paymentFilter,
    statusFilter,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  // Sort logic
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    switch (sortBy) {
      case "oldest":
        return list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
      case "high":
        return list.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
      case "low":
        return list.sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
      case "title":
        return list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "newest":
      default:
        return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
  }, [filteredItems, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(start, start + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  // Filter totals
  const totalFilteredExpense = useMemo(() => {
    return filteredItems
      .filter((x) => x.type !== "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
  }, [filteredItems]);

  const totalFilteredIncome = useMemo(() => {
    return filteredItems
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + (Number(x.amount) || 0), 0);
  }, [filteredItems]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedItems.map((x) => x._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} selected transaction(s)?`)) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleBulkExportSelected = () => {
    if (selectedIds.size === 0) return;
    const selectedItems = items.filter((x) => selectedIds.has(x._id));
    const header = "ID,Date,Title,Type,Category,Amount,PaymentMethod,Merchant,Status,Tags,Notes\n";
    const rows = selectedItems
      .map((x) => {
        const cleanTitle = `"${(x.title || "").replace(/"/g, '""')}"`;
        const cleanNotes = `"${(x.notes || "").replace(/"/g, '""')}"`;
        const cleanMerchant = `"${(x.merchant || "").replace(/"/g, '""')}"`;
        const cleanTags = `"${(Array.isArray(x.tags) ? x.tags.join(";") : "").replace(/"/g, '""')}"`;
        return `${x._id},${(x.date || "").slice(0, 10)},${cleanTitle},${x.type || "expense"},${x.category},${x.amount},${x.paymentMethod || "UPI"},${cleanMerchant},${x.status || "Completed"},${cleanTags},${cleanNotes}`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selected_transactions_${Date.now()}.csv`;
    link.click();
    notify(`📥 Exported ${selectedItems.length} selected transactions`);
  };

  const clearAllFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setCategoryFilter("All");
    setPaymentFilter("All");
    setStatusFilter("All");
    setDatePreset("All");
    setCustomStartDate("");
    setCustomEndDate("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const isFilterActive =
    search ||
    typeFilter !== "All" ||
    categoryFilter !== "All" ||
    paymentFilter !== "All" ||
    statusFilter !== "All" ||
    datePreset !== "All";

  return (
    <div className="transactions-page animate-fade-in">
      {/* Header Bar */}
      <div className="page-header card card-glow">
        <div className="page-header-info">
          <div className="section-pretitle">FINANCIAL LEDGER</div>
          <h2>Transactions Explorer 💳</h2>
          <p className="card-subtitle">
            Search, filter, categorize, and inspect all financial records
          </p>
        </div>

        <div className="page-header-actions">
          <div className="view-toggle-btns">
            <button
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              📋 Table
            </button>
            <button
              className={`view-btn ${viewMode === "card" ? "active" : ""}`}
              onClick={() => setViewMode("card")}
              title="Card View"
            >
              🗂️ Cards
            </button>
          </div>

          <button className="btn-primary" onClick={() => onOpenNewTransaction("expense")}>
            <span>+</span> New Transaction
          </button>
        </div>
      </div>

      {/* Summary Chips for Filtered Set */}
      <div className="filter-summary-bar">
        <div className="filtered-chip">
          <span>Found:</span> <b>{filteredItems.length} records</b>
        </div>
        <div className="filtered-chip expense">
          <span>Total Spent:</span> <b>{formatINR(totalFilteredExpense)}</b>
        </div>
        <div className="filtered-chip income">
          <span>Total Inflow:</span> <b>{formatINR(totalFilteredIncome)}</b>
        </div>
        <div className="filtered-chip balance">
          <span>Net:</span> <b>{formatINR(totalFilteredIncome - totalFilteredExpense)}</b>
        </div>
        {isFilterActive && (
          <button className="btn-reset-filters" onClick={clearAllFilters}>
            ✕ Reset Filters
          </button>
        )}
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="card filter-toolbar">
        {/* Search Bar */}
        <div className="search-row">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search title, merchant (@Amazon), tags (#coffee), or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>

          <div className="sort-wrap">
            <label>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">📅 Newest Date</option>
              <option value="oldest">📅 Oldest Date</option>
              <option value="high">₹ Highest Amount</option>
              <option value="low">₹ Lowest Amount</option>
              <option value="title">🔤 Title (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="filters-grid">
          {/* Type Filter */}
          <div className="filter-item">
            <label>Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Types (In & Out)</option>
              <option value="Expense">🔴 Expenses Only</option>
              <option value="Income">🟢 Incomes Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-item">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {Object.entries(CATEGORIES).map(([catName, cfg]) => (
                <option key={catName} value={catName}>
                  {cfg.icon} {catName}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="filter-item">
            <label>Payment Method:</label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Payment Modes</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.icon} {pm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-item">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === "Completed" ? "✅ Completed" : "⏳ Pending"}
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div className="filter-item">
            <label>Date Range:</label>
            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>
        </div>

        {/* Custom Date Pickers (if selected) */}
        {datePreset === "custom" && (
          <div className="custom-date-row">
            <div className="date-picker-wrap">
              <label>From Date:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="date-picker-wrap">
              <label>To Date:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Selection Actions Banner */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-banner animate-slide-down">
          <div className="bulk-banner-left">
            <span className="bulk-count">
              <b>{selectedIds.size}</b> transaction(s) selected
            </span>
          </div>
          <div className="bulk-banner-actions">
            <button className="btn-bulk-export" onClick={handleBulkExportSelected}>
              ⬇ Export Selected (CSV)
            </button>
            <button className="btn-bulk-delete" onClick={handleBulkDeleteConfirm}>
              🗑️ Delete Selected
            </button>
            <button className="btn-bulk-cancel" onClick={() => setSelectedIds(new Set())}>
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Data Container: Table or Cards */}
      {viewMode === "table" ? (
        <div className="card table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th className="th-check">
                  <input
                    type="checkbox"
                    checked={
                      paginatedItems.length > 0 &&
                      paginatedItems.every((x) => selectedIds.has(x._id))
                    }
                    onChange={handleSelectAll}
                    title="Select all on this page"
                  />
                </th>
                <th>Date</th>
                <th>Title & Merchant</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Tags</th>
                <th>Status</th>
                <th className="th-amount">Amount</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((tx) => {
                const cat = CATEGORIES[tx.category] || CATEGORIES["Other & Misc"];
                const isInc = tx.type === "income";
                const isSelected = selectedIds.has(tx._id);

                return (
                  <tr
                    key={tx._id}
                    className={`tx-tr ${isSelected ? "selected-row" : ""}`}
                    onClick={() => handleToggleSelect(tx._id)}
                  >
                    <td className="td-check" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(tx._id)}
                      />
                    </td>
                    <td className="td-date">{formatDate(tx.date)}</td>
                    <td className="td-main">
                      <div className="tx-title-bold">{tx.title}</div>
                      {tx.merchant && (
                        <span className="merchant-sub">@{tx.merchant}</span>
                      )}
                      {tx.notes && (
                        <p className="tx-notes-small">{tx.notes}</p>
                      )}
                    </td>
                    <td className="td-cat">
                      <span
                        className="cat-badge"
                        style={{ background: cat.bg, color: cat.color }}
                      >
                        {cat.icon} {tx.category}
                      </span>
                    </td>
                    <td className="td-pm">
                      <span className="pm-chip">
                        {tx.paymentMethod || "UPI"}
                      </span>
                    </td>
                    <td className="td-tags">
                      {Array.isArray(tx.tags) && tx.tags.length > 0 ? (
                        <div className="tags-flex">
                          {tx.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="tag-pill"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearch(t);
                              }}
                              title={`Filter by #${t}`}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td className="td-status">
                      <span
                        className={`status-chip ${
                          tx.status === "Pending" ? "pending" : "completed"
                        }`}
                      >
                        {tx.status || "Completed"}
                      </span>
                    </td>
                    <td className={`td-amount ${isInc ? "income" : "expense"}`}>
                      {isInc ? "+" : "-"}
                      {formatINR(tx.amount)}
                    </td>
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="row-action-btn"
                        title="Duplicate record"
                        onClick={() => onDuplicateTransaction(tx)}
                      >
                        📋
                      </button>
                      <button
                        className="row-action-btn"
                        title="Edit transaction"
                        onClick={() => onOpenEditTransaction(tx)}
                      >
                        ✏️
                      </button>
                      <button
                        className="row-action-btn delete"
                        title="Delete transaction"
                        onClick={() => onDeleteTransaction(tx._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedItems.length === 0 && (
            <div className="empty-state">
              <p>🔍 No matching transactions found for the active filters.</p>
              <button className="btn-secondary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Modern Card Grid View */
        <div className="cards-grid">
          {paginatedItems.map((tx) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES["Other & Misc"];
            const isInc = tx.type === "income";
            const isSelected = selectedIds.has(tx._id);

            return (
              <div
                key={tx._id}
                className={`card tx-card-item ${isSelected ? "selected-card" : ""}`}
                onClick={() => handleToggleSelect(tx._id)}
              >
                <div className="tx-card-top">
                  <div className="tx-card-cat-wrap">
                    <span
                      className="cat-badge"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      {cat.icon} {tx.category}
                    </span>
                    {tx.isRecurring && (
                      <span className="recurring-badge" title="Recurring subscription">
                        🔁 Recurring
                      </span>
                    )}
                  </div>
                  <div className="tx-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="row-action-btn"
                      title="Duplicate"
                      onClick={() => onDuplicateTransaction(tx)}
                    >
                      📋
                    </button>
                    <button
                      className="row-action-btn"
                      title="Edit"
                      onClick={() => onOpenEditTransaction(tx)}
                    >
                      ✏️
                    </button>
                    <button
                      className="row-action-btn delete"
                      title="Delete"
                      onClick={() => onDeleteTransaction(tx._id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h4 className="tx-card-title">{tx.title}</h4>
                {tx.merchant && <span className="merchant-sub">@{tx.merchant}</span>}

                {tx.notes && <p className="tx-card-notes">{tx.notes}</p>}

                {Array.isArray(tx.tags) && tx.tags.length > 0 && (
                  <div className="tags-flex">
                    {tx.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="tag-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearch(t);
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="tx-card-footer">
                  <div className="tx-card-meta">
                    <span className="tx-card-date">📅 {formatDate(tx.date)}</span>
                    <span className="tx-card-pm">💳 {tx.paymentMethod || "UPI"}</span>
                  </div>
                  <div className={`tx-card-amt ${isInc ? "income" : "expense"}`}>
                    {isInc ? "+" : "-"}
                    {formatINR(tx.amount)}
                  </div>
                </div>
              </div>
            );
          })}

          {paginatedItems.length === 0 && (
            <div className="empty-state">
              <p>🔍 No matching transactions found.</p>
              <button className="btn-secondary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {sortedItems.length > 0 && (
        <div className="card pagination-bar">
          <div className="pagination-left">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedItems.length)} of{" "}
              {sortedItems.length} transactions
            </span>
            <div className="items-per-page">
              <label>Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="pagination-nav">
            <button
              className="page-nav-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &larr; Prev
            </button>
            <span className="page-indicator">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </span>
            <button
              className="page-nav-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
