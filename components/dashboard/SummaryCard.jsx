'use client';

import React from 'react';

export default function SummaryCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'default',
}) {
  const variantStyles = {
    default: {
      border: 'border-slate-200',
      bg: 'bg-white',
      iconBg: 'bg-indigo-50 text-indigo-600',
      text: 'text-slate-900',
    },
    income: {
      border: 'border-emerald-100',
      bg: 'bg-white',
      iconBg: 'bg-emerald-50 text-emerald-600',
      text: 'text-emerald-600',
    },
    expense: {
      border: 'border-rose-100',
      bg: 'bg-white',
      iconBg: 'bg-rose-50 text-rose-600',
      text: 'text-rose-600',
    },
    balance: {
      border: 'border-indigo-100',
      bg: 'bg-white',
      iconBg: 'bg-indigo-600 text-white shadow-sm shadow-indigo-200',
      text: 'text-indigo-600',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`p-5 rounded-2xl border ${style.border} ${style.bg} shadow-xs hover:shadow-sm transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          Rs. {Number(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
    </div>
  );
}