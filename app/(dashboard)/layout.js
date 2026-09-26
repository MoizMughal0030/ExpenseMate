'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProtectedDashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state while verifying session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <LoadingSpinner size="md" color="text-white" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading ExpenseMate...</p>
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}