import React from 'react';
import { headers } from 'next/headers';
import { AdminSidebar } from '@/components/features/admin/admin-sidebar';

export const metadata = {
  title: 'Admin Control Center | WHEY4YOU',
  description: 'Trang quản trị nội bộ hệ thống thực phẩm thể hình WHEY4YOU.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const isLoginPage = headerList.get('x-is-admin-login') === '1';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

