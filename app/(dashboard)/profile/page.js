'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import Button from '../../../components/common/Button';

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          View your authenticated account credentials and security details
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-200">
            {session?.user?.name ? session.user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{session?.user?.name || 'Authenticated User'}</h3>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <User className="w-4 h-4" /> Full Name
            </div>
            <p className="text-sm font-bold text-slate-800">{session?.user?.name || '—'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Mail className="w-4 h-4" /> Email Address
            </div>
            <p className="text-sm font-bold text-slate-800">{session?.user?.email || '—'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" /> Authentication
            </div>
            <p className="text-sm font-bold text-emerald-600">NextAuth JWT Session (Active)</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" /> Data Security
            </div>
            <p className="text-sm font-bold text-slate-800">Multi-tenant User Scoped</p>
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Sign Out</h4>
            <p className="text-xs text-slate-400">End your current session safely</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            icon={LogOut}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}