'use client';

import React from 'react';

const PALETTE = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
];

export default function CategoryExpenseChart({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 text-sm">
        <p>No expense data recorded for this period.</p>
      </div>
    );
  }

  const total = categories.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  // Calculate SVG doughnut arc slices
  let accumulatedAngle = 0;
  const radius = 70;
  const strokeWidth = 28;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  const slices = categories.map((cat, i) => {
    const pct = total > 0 ? (cat.totalAmount / total) : 0;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += pct;
    const color = PALETTE[i % PALETTE.length];

    return {
      ...cat,
      color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      {/* SVG Doughnut */}
      <div className="flex items-center justify-center relative">
        <svg viewBox="0 0 200 200" className="w-52 h-52 -rotate-90 transform">
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-300 hover:opacity-85"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-base font-bold text-slate-900">
            Rs. {Math.round(total).toLocaleString('en-PK')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-2">
        {categories.map((cat, i) => {
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="font-semibold text-slate-700 truncate">{cat.category}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900 mr-1.5">
                  Rs. {cat.totalAmount.toLocaleString('en-PK')}
                </span>
                <span className="text-slate-400">({cat.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}