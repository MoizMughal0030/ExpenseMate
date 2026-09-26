'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Download } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';
import Button from '../../../components/common/Button';
import TransactionTable from '../../../components/transactions/TransactionTable';
import TransactionFilters from '../../../components/transactions/TransactionFilters';
import TransactionModal from '../../../components/transactions/TransactionModal';
import DeleteConfirmModal from '../../../components/transactions/DeleteConfirmModal';
import { SkeletonTable } from '../../../components/common/Skeleton';
import Toast from '../../../components/common/Toast';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'date_desc',
    page: 1,
    limit: 15,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.transactions.list(filters);
      if (res?.success) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch transactions' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  }

  function handlePageChange(newPage) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  function handleOpenAdd() {
    setSelectedTx(null);
    setModalOpen(true);
  }

  function handleOpenEdit(tx) {
    setSelectedTx(tx);
    setModalOpen(true);
  }

  function handleOpenDelete(tx) {
    setDeletingTx(tx);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingTx) return;
    setDeleteLoading(true);
    try {
      await api.transactions.delete(deletingTx.id);
      setToast({ type: 'success', message: 'Transaction deleted successfully.' });
      setDeleteModalOpen(false);
      setDeletingTx(null);
      fetchTransactions();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete transaction' });
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleTransactionSaved() {
    setModalOpen(false);
    setSelectedTx(null);
    setToast({
      type: 'success',
      message: selectedTx ? 'Transaction updated successfully.' : 'Transaction recorded successfully.',
    });
    fetchTransactions();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and filter your complete personal financial records
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/csv">
            <Button variant="secondary" size="sm" icon={Download}>
              CSV Tools
            </Button>
          </Link>
          <Button size="sm" onClick={handleOpenAdd} icon={Plus}>
            New Transaction
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() =>
          setFilters({ search: '', type: '', category: '', sort: 'date_desc', page: 1, limit: 15 })
        }
      />

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={8} />
      ) : (
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onOpenAdd={handleOpenAdd}
        />
      )}

      {/* Add/Edit Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={selectedTx}
        onSaved={handleTransactionSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete this ${deletingTx?.type || ''} transaction for Rs. ${deletingTx?.amount || ''}?`}
      />

      {/* Toast Notification */}
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