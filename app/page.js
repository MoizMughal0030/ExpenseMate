'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  Receipt,
  Wallet,
  PieChart,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">ExpenseMate</span>
        </Link>

        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard">
              <Button size="md" icon={ArrowRight}>Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="md">Log In</Button>
              </Link>
              <Link href="/register">
                <Button size="md">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 sm:px-12 py-16 sm:py-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          Software Construction Project
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Smart, effortless personal expense tracking for your financial goals.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          ExpenseMate helps you monitor income, track category expenses, set monthly budgets with automated threshold warning alerts, and visualize financial growth.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={session ? '/dashboard' : '/register'}>
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-md shadow-indigo-200" icon={ArrowRight}>
              {session ? 'Open Your Dashboard' : 'Create Free Account'}
            </Button>
          </Link>
          {!session && (
            <Link href="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                Sign In to Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="px-6 sm:px-12 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered with complete client-server separation
          </h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">
            Every feature is backed by dedicated Mongoose database models and secure REST API endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Income & Expense Tracking</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Record both earnings and expenditures with custom categories, dates, and descriptions. Filter by month, year, or keyword instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Monthly Budget Plans</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Allocate specific monthly budgets per spending category. Real-time calculations compare actual spending against your limits.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Automated Budget Alerts</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Automatic status detection flags high usage when spending reaches 80% and notifies you immediately if a budget limit is exceeded.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Interactive Analytics</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Visualize category-wise expenses, compare monthly earnings against spending, and inspect 6-month historical trends.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">CSV Import & Export</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Seamlessly import transactions via CSV with row-by-row validation checks. Export your complete financial history anytime.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Private & Multi-Tenant</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Protected by NextAuth.js and bcrypt password hashing. Every single query is strictly scoped to your private user ID.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500">
        <p>ExpenseMate — Personal Expense Manager © 2026. University Software Construction Assignment.</p>
        <p className="mt-1">Built with Next.js, React, Tailwind CSS, Mongoose, MongoDB Atlas & NextAuth.js.</p>
      </footer>
    </div>
  );
}