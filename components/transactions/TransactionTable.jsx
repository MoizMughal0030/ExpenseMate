'use client';

import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function TransactionTable({
  transactions = [],
  pagination = {},
  onPageChange,
  onEdit,
  onDelete,
  onOpenAdd,
}) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try adjusting your filters or record a new transaction."
          actionText="Add Transaction"
          onAction={onOpenAdd}
        />
      </div>
    );
  }

  const { page = 1, totalPages = 1, total = 0 } = pagination;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {transactions.map((t) => {
              const isIncome = t.type === 'income';
              const formattedDate = new Date(t.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span className="capitalize">{t.type}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{t.category}</td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {t.description || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs">{formattedDate}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    <span className={isIncome ? 'text-emerald-600' : 'text-slate-900'}>
                      {isIncome ? '+' : '-'}Rs. {Number(t.amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        title="Edit Transaction"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        title="Delete Transaction"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total transactions)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}