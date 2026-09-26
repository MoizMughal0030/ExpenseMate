'use client';

import React, { useState } from 'react';
import CsvImportCard from '../../../components/csv/CsvImportCard';
import CsvExportCard from '../../../components/csv/CsvExportCard';
import Toast from '../../../components/common/Toast';

export default function CsvPage() {
  const [toast, setToast] = useState(null);

  function handleImportSuccess(data) {
    setToast({
      type: 'success',
      message: `Successfully imported ${data.importedCount} transaction(s)!`,
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">CSV Data Operations</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Import and export your financial records using standardized CSV spreadsheets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CsvImportCard onImportSuccess={handleImportSuccess} />
        <CsvExportCard />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}