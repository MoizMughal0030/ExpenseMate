'use client';

import React from 'react';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyTrendChart({ trends = [] }) {
  if (!trends || trends.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        No historical trend data available.
      </div>
    );
  }

  const maxVal = Math.max(...trends.map((t) => Math.max(t.income, t.expense, 1)));

  return (
    <div className="space-y-4">
      {/* Bars Chart */}
      <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-100">
        {trends.map((t, idx) => {
          const incHeight = Math.round((t.income / maxVal) * 100);
          const expHeight = Math.round((t.expense / maxVal) * 100);
          const monthLabel = MONTH_NAMES[t.month] || t.period;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 h-28">
                {/* Income Sub-bar */}
                <div
                  title={`Income: Rs. ${t.income}`}
                  className="w-3 sm:w-4 bg-emerald-400 rounded-t transition-all duration-500 group-hover:bg-emerald-500"
                  style={{ height: `${incHeight}%` }}
                />
                {/* Expense Sub-bar */}
                <div
                  title={`Expense: Rs. ${t.expense}`}
                  className="w-3 sm:w-4 bg-rose-400 rounded-t transition-all duration-500 group-hover:bg-rose-500"
                  style={{ height: `${expHeight}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">{monthLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-400" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-rose-400" />
          <span>Expense</span>
        </div>
      </div>
    </div>
  );
}