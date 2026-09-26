'use client';

import React from 'react';
import { AdminNavProvider, useAdminNav } from './admin-nav-context';
import { AdminSidebar } from './admin-sidebar';

function AdminShellContent({ children }: { children: React.ReactNode }) {
  const { isMobileOpen, closeMobileNav } = useAdminNav();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Off-canvas Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={closeMobileNav}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 transition-transform animate-in slide-in-from-left duration-200">
            <AdminSidebar onClose={closeMobileNav} className="h-full w-full" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavProvider>
      <AdminShellContent>{children}</AdminShellContent>
    </AdminNavProvider>
  );
}
