'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  Loader2,
  Images,
  Tag,
} from 'lucide-react';
import { logoutAdminAction } from '@/app/actions/admin-auth';

const NAV_ITEMS = [
  { href: '/admin', label: 'Tổng Quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/media', label: 'Thư Viện Ảnh', icon: Images, exact: false },
  { href: '/admin/banners', label: 'Quản Lý Banner', icon: SlidersHorizontal, exact: false },
  { href: '/admin/products', label: 'Sản Phẩm & Kho', icon: Package, exact: false },
  { href: '/admin/orders', label: 'Quản Lý Đơn Hàng', icon: ShoppingBag, exact: false },
  { href: '/admin/coupons', label: 'Mã Giảm Giá', icon: Tag, exact: false },
  { href: '/admin/blogs', label: 'Quản Lý Blog', icon: BookOpen, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAdminAction();
    });
  };

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col flex-shrink-0 sticky top-0 h-screen border-r border-slate-800 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider text-white text-lg">WHEY4YOU</span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Hệ thống quản trị nội bộ</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Store Link & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Supabase DB Đang Hoạt Động</span>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <span>Xem Giao Diện Cửa Hàng</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng Xuất Admin'}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
