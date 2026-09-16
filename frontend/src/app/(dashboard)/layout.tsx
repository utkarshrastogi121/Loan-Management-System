'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  FileCheck2,
  Banknote,
  Receipt,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import { RoleGuard } from '@/components/role-guard';
import { UserRole } from '@/lib/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const navItems: NavItem[] = [
  {
    name: 'Sales',
    href: '/dashboard/sales',
    icon: Users,
    allowedRoles: ['ADMIN', 'SALES'],
  },
  {
    name: 'Sanction',
    href: '/dashboard/sanction',
    icon: FileCheck2,
    allowedRoles: ['ADMIN', 'SANCTION'],
  },
  {
    name: 'Disbursement',
    href: '/dashboard/disbursement',
    icon: Banknote,
    allowedRoles: ['ADMIN', 'DISBURSEMENT'],
  },
  {
    name: 'Collection',
    href: '/dashboard/collection',
    icon: Receipt,
    allowedRoles: ['ADMIN', 'COLLECTION'],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const hasAccess = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role) || user.role === 'ADMIN';
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']}>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Clean Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 z-30 select-none">
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-wider">LOANFLOW</span>
            </Link>
          </div>

          {/* Navigation - Only 4 Options */}
          <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const accessible = hasAccess(item.allowedRoles);
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (accessible) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group',
                      isActive
                        ? 'bg-blue-50/80 text-blue-600 shadow-sm shadow-blue-500/5 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              }

              // Restricted Option
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm text-slate-300 cursor-not-allowed bg-slate-50/40"
                  title={`Restricted to ${item.allowedRoles.join(', ')}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-300" />
                    <span>{item.name}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                </div>
              );
            })}
          </nav>

          {/* Bottom Role Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {(user?.role || 'US').slice(0, 2)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || (user as any)?.fullName || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                  {user?.role || 'BORROWER'} Access
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="max-w-[1200px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
