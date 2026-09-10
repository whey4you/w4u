'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppleNav } from '@/components/layout/apple-nav';
import { AppleFooter } from '@/components/layout/apple-footer';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { FloatingActions } from '@/components/features/chat/floating-actions';

interface StoreShellProps {
  children: React.ReactNode;
}

export function StoreShell({ children }: StoreShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <AppleNav />
      <main className="flex-1">{children}</main>
      <AppleFooter />
      <CartDrawer />
      <FloatingActions />
    </>
  );
}
