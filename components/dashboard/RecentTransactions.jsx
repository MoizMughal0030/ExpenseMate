'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowRight, Receipt } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function RecentTransactions({ transactions = [], onOpenAddModal }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
        </div>
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Record your first income or expense transaction to see it here."
          actionText="Add Transaction"
          onAction={onOpenAddModal}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Your latest financial activity</p>
        </div>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {transactions.slice(0, 5).map((t) => {
          const isIncome = t.type === 'income';
          const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={t.id}
              className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {t.description || t.category}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.category} • {formattedDate}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-bold ${
                    isIncome ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {isIncome ? '+' : '-'}Rs. {Number(t.amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                </span>
                <span className="block text-[11px] text-slate-400 capitalize">{t.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}