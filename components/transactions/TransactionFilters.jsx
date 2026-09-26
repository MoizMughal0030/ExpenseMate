'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Salary',
  'Freelance',
  'Investment',
  'Food & Dining',
  'Groceries',
  'Utilities & Bills',
  'Transportation',
  'Housing & Rent',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other',
];

export default function TransactionFilters({
  filters,
  onChange,
  onReset,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type Select */}
        <div>
          <select
            value={filters.type || ''}
            onChange={(e) => onChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types (Income & Expense)</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        {/* Category Select */}
        <div>
          <select
            value={filters.category || ''}
            onChange={(e) => onChange('category', e.target.value === 'All' ? '' : e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div>
          <select
            value={filters.sort || 'date_desc'}
            onChange={(e) => onChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date_desc">Date (Newest First)</option>
            <option value="date_asc">Date (Oldest First)</option>
            <option value="amount_desc">Amount (Highest First)</option>
            <option value="amount_asc">Amount (Lowest First)</option>
          </select>
        </div>
      </div>
    </div>
  );
}