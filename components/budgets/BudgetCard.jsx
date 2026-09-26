'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import AlertBadge from '../common/AlertBadge';

export default function BudgetCard({ budget, alert, onEdit, onDelete }) {
  const budgetAmount = alert?.budgetAmount ?? budget.amount;
  const actualSpent = alert?.actualSpent ?? 0;
  const remaining = alert?.remainingAmount ?? (budgetAmount - actualSpent);
  const percentage = alert?.percentageUsed ?? (budgetAmount > 0 ? Math.round((actualSpent / budgetAmount) * 100) : 0);
  const status = alert?.status || (percentage >= 100 ? 'EXCEEDED' : percentage >= 80 ? 'WARNING' : 'NORMAL');

  let barColor = 'bg-emerald-500';
  if (status === 'EXCEEDED') barColor = 'bg-rose-500';
  else if (status === 'WARNING') barColor = 'bg-amber-500';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h4 className="font-bold text-base text-slate-800 tracking-tight">{budget.category}</h4>
            <span className="text-xs text-slate-400">
              {budget.month}/{budget.year}
            </span>
          </div>
          <AlertBadge status={status} message={alert?.message ? `${percentage}%` : null} size="sm" />
        </div>

        {/* Numbers */}
        <div className="my-3 space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-bold text-slate-900">
              Rs. {Number(actualSpent).toLocaleString('en-PK')}
            </span>
            <span className="text-xs text-slate-400">
              of Rs. {Number(budgetAmount).toLocaleString('en-PK')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <span>
              Remaining:{' '}
              <strong className={remaining < 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                Rs. {Number(remaining).toLocaleString('en-PK')}
              </strong>
            </span>
            <span className="font-semibold text-slate-600">{percentage}% used</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
        <button
          onClick={() => onEdit(budget)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs inline-flex items-center gap-1 font-medium"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => onDelete(budget)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs inline-flex items-center gap-1 font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}