'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import api from '../../lib/api';

export default function CsvExportCard() {
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [downloading, setDownloading] = useState(false);

  function handleExport() {
    setDownloading(true);
    const exportUrl = api.csv.getExportUrl({ type, category });

    // Trigger direct download
    const link = document.createElement('a');
    link.href = exportUrl;
    link.setAttribute('download', 'expensemate_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 1200);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-800">Export Transactions</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Download your personal financial records as an RFC 4180 compliant CSV document.
        </p>
      </div>

      <div className="space-y-4">
        {/* Type Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Filter by Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Transactions (Income & Expense)</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Filter by Category (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Groceries or leave empty for all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-700 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 shrink-0" />
          <span>Includes Date, Type, Category, Amount in PKR, and Descriptions.</span>
        </div>

        <Button
          onClick={handleExport}
          loading={downloading}
          variant="primary"
          icon={Download}
          className="w-full"
        >
          Download CSV File
        </Button>
      </div>
    </div>
  );
}