'use client';

import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <p>{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}