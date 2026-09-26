# ExpenseMate — Personal Expense Manager (Fullstack Application)

A modern, responsive, and secure personal finance management web application built for a university **Software Construction** project.

ExpenseMate features a decoupled three-tier Client-Server architecture implemented with **Next.js (App Router, JavaScript)**, **Tailwind CSS**, **Mongoose**, **MongoDB Atlas**, and **NextAuth.js**.

---

## 🎨 Frontend Design & Features

ExpenseMate provides an intuitive dashboard experience designed with a clean financial palette:
* **Primary / Accent**: Indigo (`#4f46e5`)
* **Income**: Emerald (`#10b981`)
* **Expenses**: Rose (`#ef4444`)
* **Warnings**: Amber (`#f59e0b`)
* **Neutrals**: Slate (`#f8fafc`, `#e2e8f0`, `#0f172a`)

### Pages Included:
1. **Landing Page (`/`)**:
   - Modern hero section with call-to-action buttons.
   - Comprehensive grid highlighting features: Income/Expense tracking, Monthly budgets, Automated threshold alerts, Interactive analytics, CSV import/export, and Multi-tenant security.
2. **Authentication Pages**:
   - **Login (`/login`)**: Form with email, password, loading spinner, error banners, and direct redirection to the dashboard via NextAuth credentials.
   - **Register (`/register`)**: Name, email, password, confirm password, client-side validation, automatic sign-in upon successful registration.
3. **Dashboard (`/dashboard`)**:
   - 4 Live Summary Cards: Total Balance, Total Income, Total Expenses, Current Month Budget.
   - Monthly Spending Overview bar comparison.
   - Budget Overview Card with progress bars and dynamic threshold alerts (`NORMAL`, `WARNING`, `EXCEEDED`).
   - Recent Transactions Table with quick Add Transaction modal.
4. **Transactions Management (`/transactions`)**:
   - Full CRUD: Add, Edit, Delete transactions without full page reloads.
   - Real-time search by description or category.
   - Filter by type (Income vs Expense), Category dropdown, and Sort options.
   - Pagination controls.
   - Delete confirmation modal.
5. **Budgets & Alerts (`/budgets`)**:
   - Create, edit, and delete category budgets per month and year.
   - Real-time spending calculations against allocated category limits.
   - Automated threshold status badges:
     - **Normal** (< 80% used)
     - **Warning / High Usage** (80% - 99.9% used)
     - **Exceeded** (≥ 100% used)
   - Monthly Budget Health summary banner.
6. **Analytics Dashboard (`/analytics`)**:
   - Filter by month and year.
   - Responsive SVG Category-wise Expense Donut Chart with interactive legend.
   - Income vs Expense comparative cashflow chart.
   - 6-Month historical spending and earnings trend chart.
   - Key metrics: Net Savings & Savings Rate percentage.
7. **CSV Operations (`/csv`)**:
   - **Import**: Drag-and-drop or file picker for `.csv` files. Row-by-row validation engine rejecting malformed entries with detailed error reporting without corrupting MongoDB.
   - **Export**: Filter by transaction type or category, downloading standard RFC 4180 CSV files directly to the browser.
8. **Account Profile (`/profile`)**:
   - Displays user name, email, active NextAuth session status, and one-click secure Sign Out.

---

## 📁 Directory Structure

```
expensemate-backend/
├── app/
│   ├── (dashboard)/                  # Protected Dashboard Route Group
│   │   ├── layout.js                 # Authentication guard, Sidebar, Navbar
│   │   ├── dashboard/page.js         # Main Dashboard
│   │   ├── transactions/page.js      # Transactions Management
│   │   ├── budgets/page.js           # Budget Management & Alerts
│   │   ├── analytics/page.js         # Analytics & SVG Charts
│   │   ├── csv/page.js               # CSV Import/Export
│   │   └── profile/page.js           # User Profile & Logout
│   ├── api/                          # Next.js Route Handlers (Backend REST API)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js# NextAuth JWT session provider
│   │   │   └── register/route.js     # User registration with bcryptjs
│   │   ├── transactions/             # Transactions CRUD & Query
│   │   ├── budgets/                  # Budgets CRUD & Alerts
│   │   ├── analytics/                # Aggregations & Trends
│   │   └── csv/                      # CSV Import & Export Handlers
│   ├── globals.css                   # Tailwind base & utilities
│   ├── layout.js                     # Root HTML layout & AuthProvider
│   ├── page.js                       # Landing Page
│   ├── login/page.js                 # Login Page
│   └── register/page.js              # Registration Page
├── components/
│   ├── providers/                    # Client NextAuth SessionProvider
│   ├── layout/                       # Sidebar & Navbar components
│   ├── common/                       # Button, Modal, LoadingSpinner, Skeleton, EmptyState, AlertBadge, Toast
│   ├── dashboard/                    # SummaryCard, RecentTransactions, BudgetOverviewCard, SpendingOverviewChart
│   ├── transactions/                 # TransactionTable, TransactionFilters, TransactionModal, DeleteConfirmModal
│   ├── budgets/                      # BudgetCard, BudgetModal, BudgetAlertBanner
│   ├── analytics/                    # CategoryExpenseChart, IncomeExpenseBarChart, MonthlyTrendChart
│   └── csv/                          # CsvImportCard, CsvExportCard
├── lib/
│   ├── api.js                        # Reusable Frontend API Client Service
│   ├── mongodb.js                    # Cached Mongoose connection helper
│   └── auth.js                       # NextAuth options & session helper
├── models/                           # User, Transaction, Budget Mongoose models
├── utils/                            # Response helpers, validation & calculations
├── test/
│   └── run-tests.js                  # 21-test automated backend test runner
├── .env.local                        # Local environment variables (gitignored)
├── jsconfig.json                     # Path aliases (@/* -> ./*)
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.js                # Tailwind CSS theme configuration
└── package.json                      # Dependencies & scripts
```

---

## ⚙️ Environment Configuration (`.env.local`)

Ensure `.env.local` contains your MongoDB Atlas connection URI and NextAuth secret:

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expensemate?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_at_least_32_chars
NEXTAUTH_URL=http://localhost:3000

# Budget Alert Warning Threshold (0.80 = 80%)
BUDGET_WARNING_THRESHOLD=0.80
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Automated Test Suite (21 Tests)
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build and Run Production Server
```bash
npm run build
npm start
```

---

## 🧪 Testing Checklist

- [x] **Registration Flow**: Register a new user with valid details, confirm password check, and automatic redirect.
- [x] **Login & Logout Flow**: Verify credential authorization, session persistence, and secure logout.
- [x] **Authentication Protection**: Direct navigation to `/dashboard` while unauthenticated automatically redirects to `/login`.
- [x] **Income & Expense CRUD**: Create income and expense transactions, edit amount and category, delete with confirmation modal.
- [x] **Transaction Filters**: Search by description, filter by income/expense, filter by category, pagination.
- [x] **Budget Management**: Create category budget, edit amount, observe progress bar.
- [x] **Budget Alerts**: Verify `NORMAL` (< 80%), `WARNING` (80%-99.9%), and `EXCEEDED` (≥ 100%) status badges and health banner.
- [x] **Financial Analytics**: View Category Donut Chart, Income vs Expense comparison, and 6-month historical trends.
- [x] **CSV Import**: Upload a CSV file, verify successful insertion, test malformed CSV to verify row error rejection.
- [x] **CSV Export**: Click "Download CSV File" to export filtered transactions.
- [x] **Responsive Layout**: Test on mobile (< 640px) with hamburger slide-over drawer and on desktop (≥ 1024px) with persistent sidebar.