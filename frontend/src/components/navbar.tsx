'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const displayName = user.name || (user as any)?.fullName || user.email?.split('@')[0] || 'User';
  const displayInitial = (displayName && displayName.charAt(0).toUpperCase()) || 'U';
  const displayRole = user?.role || 'BORROWER';

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="h-16 w-full bg-white border-b border-slate-200/80 flex items-center justify-end px-6 sticky top-0 z-40">
      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all outline-none cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm ring-2 ring-white">
                {displayInitial}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</span>
                <span className="text-[11px] font-medium text-blue-600 tracking-wide uppercase">{displayRole}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44 bg-white border border-slate-200 shadow-xl rounded-2xl p-1 mt-1">
            <DropdownMenuItem
              className="rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer focus:bg-red-50 focus:text-red-700 flex items-center gap-2 font-medium text-xs transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}