'use client';

import React from 'react';

export default function IncomeExpenseBarChart({ monthlySummary }) {
  const income = monthlySummary?.income || 0;
  const expenses = monthlySummary?.expenses || 0;
  const netSavings = monthlySummary?.netSavings || 0;

  const maxVal = Math.max(income, expenses, 1);
  const incomeHeight = Math.round((income / maxVal) * 100);
  const expenseHeight = Math.round((expenses / maxVal) * 100);

  return (
    <div className="space-y-6">
      {/* Bars Graphic */}
      <div className="h-48 flex items-end justify-center gap-12 pt-6 pb-2 border-b border-slate-100">
        {/* Income Bar */}
        <div className="flex flex-col items-center gap-2 w-20">
          <span className="text-xs font-bold text-emerald-600">
            Rs. {income.toLocaleString('en-PK')}
          </span>
          <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end overflow-hidden">
            <div
              className="w-full bg-emerald-500 rounded-t-xl transition-all duration-700 hover:bg-emerald-600"
              style={{ height: `${incomeHeight}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600">Income</span>
        </div>

        {/* Expense Bar */}
        <div className="flex flex-col items-center gap-2 w-20">
          <span className="text-xs font-bold text-rose-600">
            Rs. {expenses.toLocaleString('en-PK')}
          </span>
          <div className="w-full bg-slate-100 rounded-t-xl h-36 flex items-end overflow-hidden">
            <div
              className="w-full bg-rose-500 rounded-t-xl transition-all duration-700 hover:bg-rose-600"
              style={{ height: `${expenseHeight}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600">Expenses</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Net Savings
          </span>
          <span
            className={`text-base font-bold ${
              netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            Rs. {netSavings.toLocaleString('en-PK')}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Savings Rate
          </span>
          <span className="text-base font-bold text-indigo-600">
            {monthlySummary?.savingsRate ?? 0}%
          </span>
        </div>
      </div>
    </div>
  );
}