'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AlertBadge({ status, message, showIcon = true, size = 'md' }) {
  const normalizedStatus = (status || 'NORMAL').toUpperCase();

  const configs = {
    NORMAL: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Normal',
    },
    WARNING: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      label: 'Warning',
    },
    EXCEEDED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      label: 'Exceeded',
    },
  };

  const config = configs[normalizedStatus] || configs.NORMAL;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{message || config.label}</span>
    </span>
  );
}