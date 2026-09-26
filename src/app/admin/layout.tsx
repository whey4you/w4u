import React from 'react';
import { headers } from 'next/headers';
import { AdminShell } from '@/components/features/admin/admin-shell';

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

  return <AdminShell>{children}</AdminShell>;
}

