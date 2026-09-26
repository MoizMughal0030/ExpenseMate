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
  'Salary',
  'Freelance',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other',
];

export default function TransactionModal({
  isOpen,
  onClose,
  transaction = null,
  onSaved,
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(POPULAR_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(transaction);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setAmount(String(transaction.amount || ''));
      if (POPULAR_CATEGORIES.includes(transaction.category)) {
        setCategory(transaction.category);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(transaction.category || '');
      }
      setDescription(transaction.description || '');
      setDate(
        transaction.date
          ? new Date(transaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
    } else {
      setType('expense');
      setAmount('');
      setCategory(POPULAR_CATEGORIES[0]);
      setCustomCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [transaction, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim()
      ? customCategory.trim()
      : category;

    if (!finalCategory) {
      setError('Please select or enter a category.');
      return;
    }

    setLoading(true);

    const payload = {
      type,
      amount: parsedAmount,
      category: finalCategory,
      description: description.trim(),
      date,
    };

    try {
      if (isEditing) {
        await api.transactions.update(transaction.id, payload);
      } else {
        await api.transactions.create(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income (+)
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Amount (Rs.)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="e.g. 2500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {category === 'Other' && (
            <input
              type="text"
              placeholder="Specify custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="mt-2 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description / Note
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly internet bill or supermarket run"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}