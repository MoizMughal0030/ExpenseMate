'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import api from '../../lib/api';

export default function CsvImportCard({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid .csv file.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
    }
  }

  async function handleUpload() {
    if (!file) {
      setError('Please choose a CSV file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.csv.import(formData);
      if (res?.success) {
        setResult(res.data);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportSuccess) onImportSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
      if (err.data?.errors) {
        setResult({ rejectedRows: err.data.errors });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-800">Import Transactions</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Bulk upload income and expense records from a comma-separated values (CSV) file.
        </p>
      </div>

      {/* CSV Sample Format Guide */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
        <span className="font-bold text-slate-700 block">Expected CSV Format:</span>
        <code className="block bg-white p-2 rounded border border-slate-200 font-mono text-[11px] text-indigo-700 overflow-x-auto">
          Date,Type,Category,Amount,Description
          <br />
          2026-09-01,income,Salary,120000,"Monthly Salary"
          <br />
          2026-09-05,expense,Groceries,4500,"Supermarket Shopping"
        </code>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-6 text-center cursor-pointer transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,text/csv"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>{file.name}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-700">Click to select CSV file</p>
            <p className="text-xs text-slate-400 mt-1">Accepts standard .csv UTF-8 files</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {result?.importedCount !== undefined && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-bold">Import Completed Successfully!</p>
            <p className="mt-0.5">
              Imported {result.importedCount} transaction(s).
              {result.rejectedCount > 0 && ` Skipped ${result.rejectedCount} malformed row(s).`}
            </p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        loading={loading}
        className="w-full"
      >
        Upload and Process CSV
      </Button>

      {/* Row-by-Row Error Log Table if any */}
      {result?.rejectedRows?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Rejected Row Errors ({result.rejectedRows.length})
          </h4>
          <div className="max-h-48 overflow-y-auto border border-rose-100 rounded-xl divide-y divide-rose-100 bg-rose-50/30 text-xs">
            {result.rejectedRows.map((item, idx) => (
              <div key={idx} className="p-2.5">
                <span className="font-bold text-slate-700">Row {item.rowNumber}:</span>
                <span className="text-rose-600 ml-1.5">{item.errors?.join('; ')}</span>
                {item.rawLine && (
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-1">
                    {item.rawLine}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}