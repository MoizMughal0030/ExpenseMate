'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  RefreshCw,
} from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/common/Button';
import SummaryCard from '../../../components/dashboard/SummaryCard';
import RecentTransactions from '../../../components/dashboard/RecentTransactions';
import BudgetOverviewCard from '../../../components/dashboard/BudgetOverviewCard';
import SpendingOverviewChart from '../../../components/dashboard/SpendingOverviewChart';
import { SkeletonCard, SkeletonTable } from '../../../components/common/Skeleton';
import Toast from '../../../components/common/Toast';
import TransactionModal from '../../../components/transactions/TransactionModal';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [budgetAlerts, setBudgetAlerts] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [toast, setToast] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [analyticsRes, alertsRes, txRes] = await Promise.all([
        api.analytics.getSummary({ month: currentMonth, year: currentYear }),
        api.budgets.alerts({ month: currentMonth, year: currentYear }),
        api.transactions.list({ limit: 5, sort: 'date_desc' }),
      ]);

      if (analyticsRes?.success) setAnalytics(analyticsRes.data);
      if (alertsRes?.success) setBudgetAlerts(alertsRes.data);
      if (txRes?.success) setRecentTransactions(txRes.data.transactions || []);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  function handleTransactionSaved() {
    setIsAddModalOpen(false);
    setToast({ type: 'success', message: 'Transaction created successfully!' });
    fetchDashboardData();
  }

  const overview = analytics?.overview || { totalIncome: 0, totalExpenses: 0, currentBalance: 0 };
  const monthly = analytics?.monthlySummary || { income: 0, expenses: 0, netSavings: 0, savingsRate: 0 };
  const budgetSummary = budgetAlerts?.summary;

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time balance, spending metrics, and budget alerts
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            icon={RefreshCw}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={Plus}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Balance"
            amount={overview.currentBalance}
            subtitle="All-time net savings"
            icon={Wallet}
            variant="balance"
          />
          <SummaryCard
            title="Total Income"
            amount={overview.totalIncome}
            subtitle={`This month: Rs. ${monthly.income.toLocaleString('en-PK')}`}
            icon={ArrowDownLeft}
            variant="income"
          />
          <SummaryCard
            title="Total Expenses"
            amount={overview.totalExpenses}
            subtitle={`This month: Rs. ${monthly.expenses.toLocaleString('en-PK')}`}
            icon={ArrowUpRight}
            variant="expense"
          />
          <SummaryCard
            title="Current Budget"
            amount={budgetSummary?.totalBudgeted || 0}
            subtitle={budgetSummary?.totalSpent ? `Rs. ${budgetSummary.totalSpent.toLocaleString('en-PK')} spent (${budgetSummary.overallPercentageUsed}%)` : 'No expenses against budget'}
            icon={CreditCard}
            variant="default"
          />
        </div>
      )}

      {/* Middle Grid: Spending Chart & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
          ) : (
            <SpendingOverviewChart
              monthlySummary={monthly}
              categoryExpenses={analytics?.categoryExpenses || []}
            />
          )}
        </div>
        <div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
          ) : (
            <BudgetOverviewCard
              summary={budgetAlerts?.summary}
              alerts={budgetAlerts?.alerts || []}
            />
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <div>
        {loading ? (
          <SkeletonTable rows={4} />
        ) : (
          <RecentTransactions
            transactions={recentTransactions}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </div>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={handleTransactionSaved}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}