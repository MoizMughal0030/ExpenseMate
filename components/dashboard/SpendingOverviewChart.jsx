'use client';

import React from 'react';

export default function SpendingOverviewChart({ monthlySummary, categoryExpenses = [] }) {
  const income = monthlySummary?.income || 0;
  const expenses = monthlySummary?.expenses || 0;
  const maxVal = Math.max(income, expenses, 1);

  const incomePct = Math.round((income / maxVal) * 100);
  const expensePct = Math.round((expenses / maxVal) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Monthly Spending Overview</h3>
          <p className="text-xs text-slate-400 mt-0.5">Income vs Expenditure for this month</p>
        </div>
      </div>

      {/* Visual Bar Comparison */}
      <div className="space-y-4 my-2">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Total Income</span>
            <span className="text-emerald-600">Rs. {income.toLocaleString('en-PK')}</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${incomePct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Total Expenses</span>
            <span className="text-rose-600">Rs. {expenses.toLocaleString('en-PK')}</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${expensePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Categories Breakdown */}
      {categoryExpenses.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
            Top Expense Categories
          </h4>
          <div className="space-y-2">
            {categoryExpenses.slice(0, 3).map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-slate-700 font-medium">{cat.category}</span>
                <span className="text-slate-500 font-semibold">
                  Rs. {cat.totalAmount.toLocaleString('en-PK')} ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}