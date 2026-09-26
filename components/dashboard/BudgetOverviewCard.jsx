'use client';

import React from 'react';
import Link from 'next/link';
import { Wallet, ArrowRight, AlertTriangle } from 'lucide-react';
import AlertBadge from '../common/AlertBadge';

export default function BudgetOverviewCard({ summary, alerts = [] }) {
  const totalBudget = summary?.totalBudgeted || 0;
  const totalSpent = summary?.totalSpent || 0;
  const remaining = summary?.totalRemaining || 0;
  const percentage = summary?.overallPercentageUsed || 0;

  // Determine bar color
  let barColor = 'bg-indigo-600';
  if (percentage >= 100) barColor = 'bg-rose-600';
  else if (percentage >= 80) barColor = 'bg-amber-500';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Budget Progress</h3>
              <p className="text-[11px] text-slate-400">Current Month</p>
            </div>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {totalBudget > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  Rs. {totalSpent.toLocaleString('en-PK')}
                </span>
                <span className="text-xs text-slate-400 ml-1.5">
                  spent of Rs. {totalBudget.toLocaleString('en-PK')}
                </span>
              </div>
              <span className={`text-xs font-bold ${percentage >= 100 ? 'text-rose-600' : percentage >= 80 ? 'text-amber-600' : 'text-indigo-600'}`}>
                {percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>Remaining: <strong className={remaining < 0 ? 'text-rose-600' : 'text-slate-700'}>Rs. {remaining.toLocaleString('en-PK')}</strong></span>
              {summary?.exceededCount > 0 ? (
                <AlertBadge status="EXCEEDED" message={`${summary.exceededCount} Exceeded`} size="sm" />
              ) : summary?.warningCount > 0 ? (
                <AlertBadge status="WARNING" message={`${summary.warningCount} High Usage`} size="sm" />
              ) : (
                <AlertBadge status="NORMAL" message="Within Limits" size="sm" />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            <p>No budgets set for this month.</p>
            <Link href="/budgets" className="text-indigo-600 font-semibold hover:underline mt-1 inline-block">
              Create a category budget
            </Link>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {alerts.slice(0, 2).map((a) => (
            <div key={a.budgetId} className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 truncate max-w-[120px]">{a.category}</span>
              <AlertBadge status={a.status} message={`${a.percentageUsed}%`} size="sm" showIcon={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}