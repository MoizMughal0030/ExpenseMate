'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import api from '../../lib/api';

const POPULAR_CATEGORIES = [
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

export default function BudgetModal({
  isOpen,
  onClose,
  budget = null,
  currentMonth,
  currentYear,
  onSaved,
}) {
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(currentMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear || new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(budget);

  useEffect(() => {
    if (budget) {
      if (POPULAR_CATEGORIES.includes(budget.category)) {
        setCategory(budget.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(budget.category || '');
      }
      setAmount(String(budget.amount || ''));
      setMonth(budget.month);
      setYear(budget.year);
    } else {
      setCategory(POPULAR_CATEGORIES[0]);
      setCustomCategory('');
      setAmount('');
      setMonth(currentMonth || new Date().getMonth() + 1);
      setYear(currentYear || new Date().getFullYear());
    }
    setError('');
  }, [budget, isOpen, currentMonth, currentYear]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim()
      ? customCategory.trim()
      : category;

    if (!finalCategory) {
      setError('Please specify a category.');
      return;
    }

    setLoading(true);

    const payload = {
      category: finalCategory,
      amount: parsedAmount,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };

    try {
      if (isEditing) {
        await api.budgets.update(budget.id, payload);
      } else {
        await api.budgets.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category Budget' : 'Set New Category Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isEditing}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {category === 'Other' && !isEditing && (
            <input
              type="text"
              placeholder="Specify custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="mt-2 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Monthly Budget Limit (Rs.)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="e.g. 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Month & Year Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              disabled={isEditing}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ].map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Year
            </label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isEditing}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Save Changes' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}