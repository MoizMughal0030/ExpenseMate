'use client';

import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There is no data to display at this time.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-4">
          <Button onClick={onAction} size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}