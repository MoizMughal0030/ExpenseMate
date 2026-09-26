'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BudgetAlertBanner({ summary }) {
  if (!summary || summary.totalBudgets === 0) return null;

  const { exceededCount = 0, warningCount = 0, totalBudgets = 0, totalBudgeted = 0, totalSpent = 0, totalRemaining = 0 } = summary;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Monthly Budget Health</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total Allocated: <strong className="text-slate-800">Rs. {totalBudgeted.toLocaleString('en-PK')}</strong> | Total Spent: <strong className="text-slate-800">Rs. {totalSpent.toLocaleString('en-PK')}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {exceededCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{exceededCount} Exceeded</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{warningCount} High Usage</span>
            </div>
          )}
          {exceededCount === 0 && warningCount === 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All Budgets Within Limit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}