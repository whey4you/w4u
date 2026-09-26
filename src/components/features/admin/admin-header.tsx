'use client';

import React, { useTransition } from 'react';
import { Database, UserCheck, LogOut, Loader2, Menu } from 'lucide-react';
import { logoutAdminAction } from '@/app/actions/admin-auth';
import { useAdminNav } from './admin-nav-context';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const [isLoggingOut, startLogout] = useTransition();
  const { openMobileNav } = useAdminNav();

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 gap-2 sm:gap-4">
      {/* Left side: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={openMobileNav}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Mở menu quản trị"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Actions & User Info */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions}
        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Supabase Live</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">Admin</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Đăng xuất khỏi hệ thống quản trị"
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/60 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden md:inline">{isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}</span>
        </button>
      </div>
    </header>
  );
}

