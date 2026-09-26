'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Wallet, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';
import Button from '../../../components/common/Button';
import BudgetCard from '../../../components/budgets/BudgetCard';
import BudgetModal from '../../../components/budgets/BudgetModal';
import BudgetAlertBanner from '../../../components/budgets/BudgetAlertBanner';
import DeleteConfirmModal from '../../../components/transactions/DeleteConfirmModal';
import EmptyState from '../../../components/common/EmptyState';
import { SkeletonCard } from '../../../components/common/Skeleton';
import Toast from '../../../components/common/Toast';

export default function BudgetsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [alertsData, setAlertsData] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, alertsRes] = await Promise.all([
        api.budgets.list({ month: selectedMonth, year: selectedYear }),
        api.budgets.alerts({ month: selectedMonth, year: selectedYear }),
      ]);

      if (listRes?.success) setBudgets(listRes.data.budgets || []);
      if (alertsRes?.success) setAlertsData(alertsRes.data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load budgets' });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  function handleOpenAdd() {
    setSelectedBudget(null);
    setModalOpen(true);
  }

  function handleOpenEdit(b) {
    setSelectedBudget(b);
    setModalOpen(true);
  }

  function handleOpenDelete(b) {
    setDeletingBudget(b);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingBudget) return;
    setDeleteLoading(true);
    try {
      await api.budgets.delete(deletingBudget.id);
      setToast({ type: 'success', message: 'Budget deleted successfully.' });
      setDeleteModalOpen(false);
      setDeletingBudget(null);
      fetchBudgets();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete budget' });
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleBudgetSaved() {
    setModalOpen(false);
    setSelectedBudget(null);
    setToast({
      type: 'success',
      message: selectedBudget ? 'Budget updated successfully.' : 'Budget created successfully.',
    });
    fetchBudgets();
  }

  const alertMap = new Map();
  if (alertsData?.alerts) {
    for (const a of alertsData.alerts) {
      alertMap.set(a.budgetId, a);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Monthly Budgets</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Set category allowances and monitor threshold warning alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December',
            ].map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <input
            type="number"
            min="2000"
            max="2100"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500"
          />

          <Button size="sm" onClick={handleOpenAdd} icon={Plus}>
            Create Budget
          </Button>
        </div>
      </div>

      {/* Health Overview Banner */}
      {!loading && alertsData?.summary && (
        <BudgetAlertBanner summary={alertsData.summary} />
      )}

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              alert={alertMap.get(b.id)}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <EmptyState
            icon={Wallet}
            title="No budgets created for this month"
            description="Establish spending limits for Groceries, Bills, Entertainment, or other categories to keep your expenses in check."
            actionText="Create Category Budget"
            onAction={handleOpenAdd}
          />
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        budget={selectedBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        onSaved={handleBudgetSaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Budget"
        message={`Are you sure you want to delete the budget for '${deletingBudget?.category}'? This will remove threshold tracking for this category.`}
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