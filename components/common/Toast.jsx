'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white animate-in slide-in-from-bottom-5 duration-200">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
      )}
      <span className="text-sm font-medium text-slate-800">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}