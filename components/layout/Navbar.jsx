'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': 'Financial Dashboard',
  '/transactions': 'Transactions Management',
  '/budgets': 'Monthly Budgets',
  '/analytics': 'Spending & Income Analytics',
  '/csv': 'CSV Data Import & Export',
  '/profile': 'My Account',
};

export default function Navbar({ onOpenSidebar }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const title = PAGE_TITLES[pathname] || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden md:inline text-xs text-slate-500">Welcome,</span>
            <span className="font-semibold text-slate-800">{session.user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}