# SpendWise — Advanced Personal Finance & Expense Management System (MERN)

A comprehensive, interactive, full-stack **MERN (MongoDB, Express.js, React, Node.js)** personal finance and expense tracking application built for college project evaluation and academic grading.

---

## 📌 Project Overview

- **Project Title:** SpendWise: Personal Finance & Expense Management System
- **Student Roll Number:** `YOURROLL`
- **Architecture:** MERN Stack (MongoDB, Express, React 18, Node.js + Vite)
- **Design System:** Custom CSS3 with Dark/Light theme switching, CSS Variables, and Glassmorphism

---

## ✨ Key Features & Rubric Compliance

### 1. 10+ Data Attributes & Data Modeling
Every transaction is modeled with rich attributes:
- `title`: String (e.g. "Grocery Supplies", "Semester Lab Stipend")
- `amount`: Number (₹ format with Indian comma separators)
- `type`: Enum (`expense` | `income`)
- `category`: 11 distinct categories (Food & Dining, Travel, Shopping, Bills & Utilities, Education, Entertainment, Health & Fitness, Salary & Stipend, Freelance, Investment, Other)
- `paymentMethod`: Enum (`UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cash`)
- `merchant`: Payee / vendor tag (e.g. `@Amazon`, `@Swiggy`, `@Uber`)
- `status`: Enum (`Completed` | `Pending`)
- `date`: ISO Date format with time tracking
- `tags`: Array of custom tags (e.g. `["#college", "#study", "#exam"]`)
- `notes`: Detailed remarks, reimbursement notes, or split information
- `isRecurring`: Flag indicating recurring subscription / bills

### 2. Six Interactive Pages & Sections
1. **📊 Executive Dashboard:**
   - 6 Key KPI Cards: Net Balance, Total Inflow, Total Outflow, Savings Rate %, Month Spend vs Budget, Daily Average Spend.
   - Financial Health Score meter (0–100) with dynamic qualitative grading (Excellent, Good, Needs Attention).
   - Monthly Budget Utilization progress bar with warning thresholds (<80% Good, 80–99% Warning, >100% Exceeded).
   - Cashflow Ratio bar (Inflow vs Outflow).
   - Interactive Pure SVG Donut Chart with animated segments, hover highlighting, and category distribution percentages.
   - 6-Month Historical Spending Trend Bar Chart with dual income/expense bars.
   - Recent Activity feed with 1-click edit and view.
2. **💳 Transactions Explorer:**
   - Dual View Modes: Responsive High-Density Table View vs Modern Grid Card View.
   - Live Search: Instant filtering across Title, Merchant, Notes, and Tags.
   - Multi-Criteria Filters: Filter by Type (All/Expense/Income), Category, Payment Method, Status, and Date Range Presets (All Time, Today, This Week, This Month, Last Month, Custom Date Range).
   - Sorting Engine: Newest, Oldest, Highest Amount, Lowest Amount, Title (A-Z).
   - Bulk Operations: Checkbox multi-select, Bulk Delete with confirmation, and Export Selected as CSV.
   - Quick Duplicate record action.
   - Complete Pagination with customizable items-per-page (10, 20, 50).
3. **📈 Analytics & Financial Intelligence:**
   - Category-wise Expenditure Breakdown with percentage progress bars, transaction counts, and averages.
   - Payment Method Distribution (UPI vs Cards vs Net Banking vs Cash).
   - Monthly Cashflow Trajectory comparing historical inflow vs outflow.
   - Top Spending Merchants & Payees leaderboard.
   - AI-Powered Smart Financial Insights & Advisory: dynamic personalized recommendations assessing savings rate (50/30/20 rule), spending concentration, and recurring load.
4. **🎯 Budgets & Savings Goals:**
   - Master Monthly Budget Ceiling with real-time remaining buffer calculation.
   - Category-Specific Spending Allocations: Set individual limits for Food, Travel, Bills, Shopping, etc., with threshold warning badges.
   - Savings Goals Tracker: Target savings funds (Emergency Fund, Tech Laptop, Certification Exam, Vacation) with visual progress bars and deadline countdowns.
   - Interactive Quick Deposit & Withdrawal modal to adjust goal progress in real time.
5. **🔁 Recurring Bills & Subscriptions:**
   - Track monthly/yearly subscriptions (Netflix, Spotify, Wi-Fi, Gym, Cloud Hosting, Rent).
   - Total Normalized Monthly Recurring Burden KPI.
   - Next Renewal countdown alert (e.g. "Due in 3 days", "Due today!").
   - 1-Click Toggle to pause or resume subscriptions.
6. **📑 Reports & Academic Viva Hub:**
   - Financial Audit Statement Generator (customizable by period: All Time, Current Month, Last Month, Current Year).
   - Print-Ready / Save as PDF formatting with dedicated `@media print` stylesheets.
   - Data Export: Full CSV Export with 10+ columns and JSON Database Backup.
   - 1-Click Realistic Demo Data Seeder (loads 25+ realistic student and personal records across 3 months).
   - Academic Showcase: Full REST API specification table, MERN Architecture diagram, and 10-point evaluation checklist.

### 3. Fail-Safe Dual-Mode Engine
- **Live MongoDB Mode:** Automatically syncs with Express and MongoDB when the database is active.
- **Offline / LocalStorage Fallback:** If MongoDB or the server is not running on the examiner's machine, the application seamlessly runs using local browser storage with full CRUD, filtering, and charts, guaranteeing zero crashes during presentation!

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Optional, for persistent database mode)

### 1. Server Setup
In PowerShell or Terminal:
```bash
cd server
npm install
# Copy environment file
cp .env.example .env   # (or copy .env.example .env on Windows CMD)
npm start
```
The server will start at `http://localhost:5000`.

### 2. Client Setup
In a new PowerShell or Terminal window:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📡 RESTful API Endpoints Matrix

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | Retrieve transactions with multi-attribute filtering, search, sorting, and pagination |
| `POST` | `/api/expenses` | Create a new transaction with full validation |
| `PUT` | `/api/expenses/:id` | Update an existing transaction |
| `DELETE` | `/api/expenses/:id` | Delete a single transaction |
| `POST` | `/api/expenses/bulk-delete` | Bulk delete multiple transactions by array of IDs |
| `GET` | `/api/expenses/stats` | Aggregated statistics, category totals, and monthly trends |
| `POST` | `/api/expenses/seed` | Seed realistic mock data for testing |
| `POST` | `/api/expenses/clear` | Reset / wipe transaction records |
| `GET` | `/api/goals` | Retrieve all savings goals |
| `POST` | `/api/goals` | Create a new savings goal |
| `PATCH` | `/api/goals/:id/adjust` | Deposit or withdraw funds from a savings goal |
| `DELETE` | `/api/goals/:id` | Delete a savings goal |
| `GET` | `/api/subscriptions` | Retrieve all recurring subscriptions and bills |
| `POST` | `/api/subscriptions` | Create a new subscription |
| `PATCH` | `/api/subscriptions/:id/toggle-status` | Toggle subscription between Active and Paused |
| `DELETE` | `/api/subscriptions/:id` | Delete a subscription |
| `GET` | `/api/health` | System health check and MongoDB connection diagnostics |

---

## ⌨️ Keyboard Shortcuts
- `N` or `+` : Open New Transaction modal
- `D` : Toggle Light / Dark mode

---

## 🌐 Full Deployment Guide (Free Cloud Hosting)

SpendWise can be deployed online to share with your professor or host on a public URL.

### Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a **Free Shared M0 Cluster** (select any nearby AWS/Google Cloud region).
3. Under **Security → Database Access**, create a user (e.g. `admin`) with a secure password.
4. Under **Security → Network Access**, click **Add IP Address** → choose **Allow Access From Anywhere (`0.0.0.0/0`)**.
5. Go to **Database → Connect → Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/spendwise?retryWrites=true&w=majority
   ```

---

### Step 2: Option A — Deploy All-in-One on Render (Recommended)
This hosts both the React frontend and Express backend on a single free live URL (`https://your-app.onrender.com`). Zero CORS issues!

1. Push this project to GitHub.
2. Go to [render.com](https://render.com) and create a free account.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the following fields:
   - **Name:** `spendwise` (or your choice)
   - **Environment:** `Node`
   - **Region:** Any region close to you
   - **Branch:** `main` (or `master`)
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`
6. Click **Advanced** → **Add Environment Variable**:
   - Key: `MONGO_URI`
   - Value: Your MongoDB Atlas connection string from Step 1
   - Key: `NODE_ENV`
   - Value: `production`
7. Click **Create Web Service**. Render will automatically build the React client, install dependencies, and launch your live app!

---

### Step 2: Option B — Split Deployment (Vercel Frontend + Render Backend)
If you prefer hosting the React frontend on Vercel and the Express API on Render:

1. **Deploy Backend on Render:**
   - Follow Step 2A with Root Directory set to `server`, Build Command `npm install`, Start Command `npm start`.
   - Copy the backend URL (e.g. `https://spendwise-api.onrender.com`).
2. **Deploy Frontend on Vercel:**
   - Go to [vercel.com](https://vercel.com) → **Add New Project** → Import repository.
   - Set **Root Directory** to `client`.
   - Under **Environment Variables**, add:
     - `VITE_API_URL` = `https://spendwise-api.onrender.com`
   - Click **Deploy**. Vercel will build and serve your frontend with automatic HTTPS!
