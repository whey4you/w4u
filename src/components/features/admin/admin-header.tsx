'use client';

import React, { useTransition } from 'react';
import { Database, UserCheck, LogOut, Loader2 } from 'lucide-react';
import { logoutAdminAction } from '@/app/actions/admin-auth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const [isLoggingOut, startLogout] = useTransition();

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {actions}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>Supabase Live</span>
        </div>
        <div className="flex items-center gap-2 pl-1 sm:pl-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">Admin</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Đăng xuất khỏi hệ thống quản trị"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200/60 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{isLoggingOut ? 'Đang thoát...' : 'Đăng xuất'}</span>
        </button>
      </div>
    </header>
  );
}
