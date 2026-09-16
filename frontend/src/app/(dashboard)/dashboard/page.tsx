'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  FileCheck2,
  Banknote,
  Receipt,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DashboardModule {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const modules: DashboardModule[] = [
  {
    title: 'Sales',
    description: 'Manage pre-application registered leads and guide borrowers to apply.',
    href: '/dashboard/sales',
    icon: Users,
    allowedRoles: ['ADMIN', 'SALES'],
  },
  {
    title: 'Sanction',
    description: 'Credit underwriting queue for reviewing and approving APPLIED loans.',
    href: '/dashboard/sanction',
    icon: FileCheck2,
    allowedRoles: ['ADMIN', 'SANCTION'],
  },
  {
    title: 'Disbursement',
    description: 'Treasury liquidity release for authorized SANCTIONED loans.',
    href: '/dashboard/disbursement',
    icon: Banknote,
    allowedRoles: ['ADMIN', 'DISBURSEMENT'],
  },
  {
    title: 'Collection',
    description: 'Monitor repayments, log bank UTR settlements, and track closures.',
    href: '/dashboard/collection',
    icon: Receipt,
    allowedRoles: ['ADMIN', 'COLLECTION'],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const hasAccess = (allowedRoles: UserRole[]) => {
    return allowedRoles.includes(user.role) || user.role === 'ADMIN';
  };

  const displayName = user.name || (user as any)?.fullName || user.email?.split('@')[0] || 'Executive';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Welcome back, {displayName} 
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod) => {
          const accessible = hasAccess(mod.allowedRoles);
          const Icon = mod.icon;

          if (accessible) {
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-300 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {mod.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Open {mod.title} Queue</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          }

          // Restricted Module Card
          return (
            <div
              key={mod.href}
              className="bg-slate-50/60 border border-slate-200/60 rounded-3xl p-6 shadow-none opacity-60 cursor-not-allowed flex flex-col justify-between space-y-6 select-none"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Restricted
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-400">{mod.title}</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Requires {mod.allowedRoles.join(' or ')} role</span>
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
