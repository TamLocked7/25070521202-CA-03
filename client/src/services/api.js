import {
  INITIAL_TRANSACTIONS,
  INITIAL_GOALS,
  INITIAL_SUBSCRIPTIONS,
  DEFAULT_CATEGORY_BUDGETS,
} from "../constants";

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, "") : "") + "/api";

// Local storage helpers
const getStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn("localStorage save failed:", err);
  }
};

export const api = {
  // Connection / Health check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return { online: true, db: data.database?.connected || false, info: data };
      }
      return { online: false, db: false };
    } catch {
      return { online: false, db: false };
    }
  },

  // EXPENSES / TRANSACTIONS
  async getExpenses() {
    try {
      const res = await fetch(`${API_BASE}/expenses`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.items || [];
        setStored("spendwise_expenses", list);
        return { data: list, source: "server" };
      }
    } catch {
      // Fallback
    }
    const local = getStored("spendwise_expenses", INITIAL_TRANSACTIONS);
    return { data: local, source: "local" };
  },

  async createExpense(item) {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const created = await res.json();
        return { data: created, success: true };
      }
    } catch {
      // Offline fallback
    }
    const current = getStored("spendwise_expenses", INITIAL_TRANSACTIONS);
    const newItem = {
      ...item,
      _id: "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      date: item.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    setStored("spendwise_expenses", updated);
    return { data: newItem, success: true, offline: true };
  },

  async updateExpense(id, item) {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const updated = await res.json();
        return { data: updated, success: true };
      }
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_expenses", INITIAL_TRANSACTIONS);
    const updated = current.map((x) => (x._id === id ? { ...x, ...item } : x));
    setStored("spendwise_expenses", updated);
    return { data: { _id: id, ...item }, success: true, offline: true };
  },

  async deleteExpense(id) {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, { method: "DELETE" });
      if (res.ok) return { success: true };
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_expenses", INITIAL_TRANSACTIONS);
    setStored(
      "spendwise_expenses",
      current.filter((x) => x._id !== id)
    );
    return { success: true, offline: true };
  },

  async bulkDeleteExpenses(ids) {
    try {
      const res = await fetch(`${API_BASE}/expenses/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) return { success: true };
    } catch {
      // Fallback
    }
    const idSet = new Set(ids);
    const current = getStored("spendwise_expenses", INITIAL_TRANSACTIONS);
    setStored(
      "spendwise_expenses",
      current.filter((x) => !idSet.has(x._id))
    );
    return { success: true, offline: true };
  },

  async seedExpenses() {
    try {
      const res = await fetch(`${API_BASE}/expenses/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace: true }),
      });
      if (res.ok) {
        return { success: true };
      }
    } catch {
      // Fallback
    }
    setStored("spendwise_expenses", INITIAL_TRANSACTIONS);
    return { success: true, offline: true };
  },

  async clearAllExpenses() {
    try {
      await fetch(`${API_BASE}/expenses/clear`, { method: "POST" });
    } catch {
      // Fallback
    }
    setStored("spendwise_expenses", []);
    return { success: true };
  },

  // SAVINGS GOALS
  async getGoals() {
    try {
      const res = await fetch(`${API_BASE}/goals`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        setStored("spendwise_goals", data);
        return { data, source: "server" };
      }
    } catch {
      // Fallback
    }
    const local = getStored("spendwise_goals", INITIAL_GOALS);
    return { data: local, source: "local" };
  },

  async createGoal(goal) {
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        const data = await res.json();
        return { data, success: true };
      }
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_goals", INITIAL_GOALS);
    const newGoal = {
      ...goal,
      _id: "local_g_" + Date.now(),
      currentAmount: Number(goal.currentAmount) || 0,
    };
    const updated = [...current, newGoal];
    setStored("spendwise_goals", updated);
    return { data: newGoal, success: true, offline: true };
  },

  async adjustGoal(id, delta) {
    try {
      const res = await fetch(`${API_BASE}/goals/${id}/adjust`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (res.ok) {
        const data = await res.json();
        return { data, success: true };
      }
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_goals", INITIAL_GOALS);
    const updated = current.map((g) =>
      g._id === id ? { ...g, currentAmount: Math.max(0, (g.currentAmount || 0) + delta) } : g
    );
    setStored("spendwise_goals", updated);
    return { data: updated.find((g) => g._id === id), success: true, offline: true };
  },

  async deleteGoal(id) {
    try {
      await fetch(`${API_BASE}/goals/${id}`, { method: "DELETE" });
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_goals", INITIAL_GOALS);
    setStored(
      "spendwise_goals",
      current.filter((g) => g._id !== id)
    );
    return { success: true };
  },

  // SUBSCRIPTIONS
  async getSubscriptions() {
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        setStored("spendwise_subs", data);
        return { data, source: "server" };
      }
    } catch {
      // Fallback
    }
    const local = getStored("spendwise_subs", INITIAL_SUBSCRIPTIONS);
    return { data: local, source: "local" };
  },

  async createSubscription(sub) {
    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (res.ok) {
        const data = await res.json();
        return { data, success: true };
      }
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_subs", INITIAL_SUBSCRIPTIONS);
    const newSub = { ...sub, _id: "local_s_" + Date.now() };
    const updated = [...current, newSub];
    setStored("spendwise_subs", updated);
    return { data: newSub, success: true, offline: true };
  },

  async toggleSubscription(id) {
    try {
      const res = await fetch(`${API_BASE}/subscriptions/${id}/toggle-status`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        return { data, success: true };
      }
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_subs", INITIAL_SUBSCRIPTIONS);
    const updated = current.map((s) =>
      s._id === id ? { ...s, status: s.status === "Active" ? "Paused" : "Active" } : s
    );
    setStored("spendwise_subs", updated);
    return { data: updated.find((s) => s._id === id), success: true, offline: true };
  },

  async deleteSubscription(id) {
    try {
      await fetch(`${API_BASE}/subscriptions/${id}`, { method: "DELETE" });
    } catch {
      // Fallback
    }
    const current = getStored("spendwise_subs", INITIAL_SUBSCRIPTIONS);
    setStored(
      "spendwise_subs",
      current.filter((s) => s._id !== id)
    );
    return { success: true };
  },

  // Category budgets & overall budget
  getCategoryBudgets() {
    return getStored("spendwise_category_budgets", DEFAULT_CATEGORY_BUDGETS);
  },
  setCategoryBudgets(budgets) {
    setStored("spendwise_category_budgets", budgets);
  },
};
