'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, TrendingUp, ArrowDownLeft, ArrowUpRight, Wallet, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/common/Button';
import CategoryExpenseChart from '../../../components/analytics/CategoryExpenseChart';
import IncomeExpenseBarChart from '../../../components/analytics/IncomeExpenseBarChart';
import MonthlyTrendChart from '../../../components/analytics/MonthlyTrendChart';
import SummaryCard from '../../../components/dashboard/SummaryCard';
import { SkeletonCard } from '../../../components/common/Skeleton';
import Toast from '../../../components/common/Toast';

export default function AnalyticsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.analytics.getSummary({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res?.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const overview = analytics?.overview || { totalIncome: 0, totalExpenses: 0, currentBalance: 0 };
  const monthly = analytics?.monthlySummary || { income: 0, expenses: 0, netSavings: 0, savingsRate: 0 };
  const categoryExpenses = analytics?.categoryExpenses || [];
  const categoryIncome = analytics?.categoryIncome || [];
  const monthlyTrends = analytics?.monthlyTrends || [];

  return (
    <div className="space-y-6">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Visualize income distributions, expense breakdown, and savings trends
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December',
            ].map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="2000"
            max="2100"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500"
          />

          <Button variant="secondary" size="sm" onClick={fetchAnalytics} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 Cards Summary */}
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
            title="Net Balance"
            amount={overview.currentBalance}
            subtitle="All-time net financial position"
            icon={Wallet}
            variant="balance"
          />
          <SummaryCard
            title="Monthly Income"
            amount={monthly.income}
            subtitle={`Period: ${selectedMonth}/${selectedYear}`}
            icon={ArrowDownLeft}
            variant="income"
          />
          <SummaryCard
            title="Monthly Expenses"
            amount={monthly.expenses}
            subtitle={`Period: ${selectedMonth}/${selectedYear}`}
            icon={ArrowUpRight}
            variant="expense"
          />
          <SummaryCard
            title="Net Savings"
            amount={monthly.netSavings}
            subtitle={`Savings rate: ${monthly.savingsRate}%`}
            icon={TrendingUp}
            variant={monthly.netSavings >= 0 ? 'income' : 'expense'}
          />
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expenses Doughnut */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Category-wise Expenses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Where your money went this month</p>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse bg-slate-50 rounded-xl" />
          ) : (
            <CategoryExpenseChart categories={categoryExpenses} />
          )}
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Income vs Expenses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Monthly cashflow balance</p>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse bg-slate-50 rounded-xl" />
          ) : (
            <IncomeExpenseBarChart monthlySummary={monthly} />
          )}
        </div>
      </div>

      {/* 6-Month Historical Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-800">6-Month Spending & Income Trend</h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical comparison of earnings and expenditures</p>
        </div>
        {loading ? (
          <div className="h-48 flex items-center justify-center animate-pulse bg-slate-50 rounded-xl" />
        ) : (
          <MonthlyTrendChart trends={monthlyTrends} />
        )}
      </div>

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