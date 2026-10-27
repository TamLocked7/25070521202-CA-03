import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Analytics from "./components/Analytics";
import BudgetsGoals from "./components/BudgetsGoals";
import Subscriptions from "./components/Subscriptions";
import ReportsProjectInfo from "./components/ReportsProjectInfo";
import TransactionModal from "./components/TransactionModal";
import GoalModal from "./components/GoalModal";
import SubscriptionModal from "./components/SubscriptionModal";
import BudgetModal from "./components/BudgetModal";
import Toast from "./components/Toast";
import { api } from "./services/api";
import "./App.css";

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem("spendwise_theme") || "emerald");
  const [rollNo, setRollNo] = useState(() => localStorage.getItem("spendwise_roll") || "25070521202");

  // Core Data State
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [budget, setBudget] = useState(() => Number(localStorage.getItem("spendwise_budget")) || 25000);
  const [categoryBudgets, setCategoryBudgets] = useState(() => api.getCategoryBudgets());

  // Connection & Diagnostics
  const [serverStatus, setServerStatus] = useState({ online: false, db: false });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal States
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [defaultTxType, setDefaultTxType] = useState("expense");

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Toast notifier
  const notify = useCallback((message, type = "info", icon = "🔔") => {
    setToast({ message, type, icon });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  // Synchronize theme to document dataset
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("spendwise_dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
    localStorage.setItem("spendwise_theme", colorTheme);
  }, [colorTheme]);

  // Synchronize budget & rollNo to localStorage
  useEffect(() => {
    localStorage.setItem("spendwise_budget", String(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("spendwise_roll", rollNo);
  }, [rollNo]);

  // Load all data on mount
  const loadData = useCallback(async () => {
    setLoading(true);
    // Check server health
    const health = await api.checkHealth();
    setServerStatus({ online: health.online, db: health.db });

    // Fetch transactions
    const expRes = await api.getExpenses();
    setItems(expRes.data || []);

    // Fetch goals
    const goalsRes = await api.getGoals();
    setGoals(goalsRes.data || []);

    // Fetch subscriptions
    const subsRes = await api.getSubscriptions();
    setSubscriptions(subsRes.data || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard shortcuts (N for new, D for dark)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setEditingTx(null);
        setDefaultTxType("expense");
        setTxModalOpen(true);
      } else if (e.key === "d" || e.key === "D") {
        setDark((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // TRANSACTION HANDLERS
  const handleOpenNewTransaction = (type = "expense") => {
    setEditingTx(null);
    setDefaultTxType(type);
    setTxModalOpen(true);
  };

  const handleOpenEditTransaction = (tx) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type || "expense");
    setTxModalOpen(true);
  };

  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTx) {
        await api.updateExpense(editingTx._id, formData);
        notify("✏️ Transaction updated successfully", "success", "✅");
      } else {
        await api.createExpense(formData);
        notify(
          formData.type === "income" ? "💵 Income logged successfully" : "✅ Expense added successfully",
          "success",
          "🎉"
        );
      }
      setTxModalOpen(false);
      setEditingTx(null);
      // Reload
      const expRes = await api.getExpenses();
      setItems(expRes.data || []);
    } catch {
      notify("❌ Error saving transaction", "error", "⚠️");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this transaction?")) return;
    try {
      await api.deleteExpense(id);
      notify("🗑️ Transaction deleted", "info", "🗑️");
      const expRes = await api.getExpenses();
      setItems(expRes.data || []);
    } catch {
      notify("❌ Failed to delete", "error", "⚠️");
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await api.bulkDeleteExpenses(ids);
      notify(`🗑️ Deleted ${ids.length} selected transactions`, "info", "🗑️");
      const expRes = await api.getExpenses();
      setItems(expRes.data || []);
    } catch {
      notify("❌ Failed bulk delete", "error", "⚠️");
    }
  };

  const handleDuplicateTransaction = async (tx) => {
    try {
      const copy = {
        title: `${tx.title} (Copy)`,
        amount: tx.amount,
        type: tx.type || "expense",
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        merchant: tx.merchant,
        status: tx.status,
        notes: tx.notes,
        tags: tx.tags,
        isRecurring: tx.isRecurring,
        date: new Date().toISOString(),
      };
      await api.createExpense(copy);
      notify("📋 Transaction duplicated", "success", "✨");
      const expRes = await api.getExpenses();
      setItems(expRes.data || []);
    } catch {
      notify("❌ Duplicate failed", "error", "⚠️");
    }
  };

  // SAVINGS GOAL HANDLERS
  const handleOpenNewGoal = () => {
    setEditingGoal(null);
    setGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        // update goal
        const res = await api.getGoals();
        const updated = res.data.map((g) => (g._id === editingGoal._id ? { ...g, ...goalData } : g));
        localStorage.setItem("spendwise_goals", JSON.stringify(updated));
        setGoals(updated);
        notify("🎯 Goal updated successfully", "success", "✅");
      } else {
        await api.createGoal(goalData);
        notify("🎯 New Savings Goal created!", "success", "🎉");
      }
      setGoalModalOpen(false);
      setEditingGoal(null);
      const res = await api.getGoals();
      setGoals(res.data || []);
    } catch {
      notify("❌ Failed to save goal", "error", "⚠️");
    }
  };

  const handleAdjustGoal = async (id, delta) => {
    try {
      await api.adjustGoal(id, delta);
      notify(
        delta > 0 ? `💰 Deposited ₹${Math.abs(delta)} to goal!` : `💸 Withdrew ₹${Math.abs(delta)} from goal`,
        "success",
        "🎯"
      );
      const res = await api.getGoals();
      setGoals(res.data || []);
    } catch {
      notify("❌ Failed to adjust goal amount", "error", "⚠️");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await api.deleteGoal(id);
      notify("🗑️ Goal deleted", "info", "🗑️");
      const res = await api.getGoals();
      setGoals(res.data || []);
    } catch {
      notify("❌ Failed to delete goal", "error", "⚠️");
    }
  };

  // SUBSCRIPTION HANDLERS
  const handleOpenNewSub = () => {
    setEditingSub(null);
    setSubModalOpen(true);
  };

  const handleOpenEditSub = (sub) => {
    setEditingSub(sub);
    setSubModalOpen(true);
  };

  const handleSaveSub = async (subData) => {
    try {
      if (editingSub) {
        const res = await api.getSubscriptions();
        const updated = res.data.map((s) => (s._id === editingSub._id ? { ...s, ...subData } : s));
        localStorage.setItem("spendwise_subs", JSON.stringify(updated));
        setSubscriptions(updated);
        notify("✏️ Subscription updated", "success", "✅");
      } else {
        await api.createSubscription(subData);
        notify("🔁 Subscription added", "success", "🎉");
      }
      setSubModalOpen(false);
      setEditingSub(null);
      const res = await api.getSubscriptions();
      setSubscriptions(res.data || []);
    } catch {
      notify("❌ Failed to save subscription", "error", "⚠️");
    }
  };

  const handleToggleSubStatus = async (id) => {
    try {
      await api.toggleSubscription(id);
      const res = await api.getSubscriptions();
      setSubscriptions(res.data || []);
      notify("Status toggled", "info", "🔄");
    } catch {
      notify("❌ Failed to update status", "error", "⚠️");
    }
  };

  const handleDeleteSub = async (id) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await api.deleteSubscription(id);
      notify("🗑️ Subscription deleted", "info", "🗑️");
      const res = await api.getSubscriptions();
      setSubscriptions(res.data || []);
    } catch {
      notify("❌ Failed to delete subscription", "error", "⚠️");
    }
  };

  // CATEGORY BUDGET HANDLERS
  const handleSaveCategoryBudgets = (newBudgets) => {
    api.setCategoryBudgets(newBudgets);
    setCategoryBudgets(newBudgets);
    notify("⚙️ Category budgets updated successfully", "success", "✅");
  };

  // DEMO SEED & RESET
  const handleSeedData = async () => {
    if (!confirm("Load realistic 25+ demo transactions across categories and dates for examiner review?")) return;
    try {
      await api.seedExpenses();
      notify("🎲 Loaded realistic student & personal demo transactions!", "success", "🚀");
      await loadData();
    } catch {
      notify("❌ Seeding failed", "error", "⚠️");
    }
  };

  const handleClearAllData = async () => {
    if (!confirm("⚠️ CAUTION: Are you sure you want to clear all transactions?")) return;
    try {
      await api.clearAllExpenses();
      notify("🧹 Cleared all transactions", "info", "🧹");
      await loadData();
    } catch {
      notify("❌ Failed to clear database", "error", "⚠️");
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dark={dark}
        setDark={setDark}
        colorTheme={colorTheme}
        setColorTheme={setColorTheme}
        serverStatus={serverStatus}
        onOpenNewTransaction={() => handleOpenNewTransaction("expense")}
        rollNo={rollNo}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {loading && (
          <div className="loading-splash">
            <div className="spinner"></div>
            <p>Loading SpendWise financial engine...</p>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === "dashboard" && (
              <Dashboard
                items={items}
                budget={budget}
                setBudget={setBudget}
                onOpenNewTransaction={handleOpenNewTransaction}
                onOpenEditTransaction={handleOpenEditTransaction}
                onNavigate={setActiveTab}
                onSeedData={handleSeedData}
              />
            )}

            {activeTab === "transactions" && (
              <Transactions
                items={items}
                onOpenNewTransaction={handleOpenNewTransaction}
                onOpenEditTransaction={handleOpenEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onBulkDelete={handleBulkDelete}
                onDuplicateTransaction={handleDuplicateTransaction}
                notify={notify}
              />
            )}

            {activeTab === "analytics" && <Analytics items={items} />}

            {activeTab === "budgets" && (
              <BudgetsGoals
                items={items}
                monthlyBudget={budget}
                setMonthlyBudget={setBudget}
                categoryBudgets={categoryBudgets}
                onOpenBudgetModal={() => setBudgetModalOpen(true)}
                goals={goals}
                onOpenNewGoal={handleOpenNewGoal}
                onOpenEditGoal={handleOpenEditGoal}
                onDeleteGoal={handleDeleteGoal}
                onAdjustGoal={handleAdjustGoal}
              />
            )}

            {activeTab === "subscriptions" && (
              <Subscriptions
                subscriptions={subscriptions}
                onOpenNewSub={handleOpenNewSub}
                onOpenEditSub={handleOpenEditSub}
                onToggleStatus={handleToggleSubStatus}
                onDeleteSub={handleDeleteSub}
              />
            )}

            {activeTab === "reports" && (
              <ReportsProjectInfo
                items={items}
                rollNo={rollNo}
                setRollNo={setRollNo}
                onSeedData={handleSeedData}
                onClearAllData={handleClearAllData}
                notify={notify}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => {
          setTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTx}
        defaultType={defaultTxType}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />

      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => {
          setSubModalOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSub}
        initialData={editingSub}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        categoryBudgets={categoryBudgets}
        onSave={handleSaveCategoryBudgets}
      />

      {/* Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
