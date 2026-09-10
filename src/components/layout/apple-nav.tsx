'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Container } from '@/components/ui/container';
import { SearchModal } from './search-modal';

export function AppleNav() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const links = [
    { label: 'Whey Protein', href: '/products?category=whey' },
    { label: 'Sức Mạnh & Sức Bền', href: '/products?category=strength' },
    { label: 'Vitamins & Khoáng Chất', href: '/products?category=vitamins' },
    { label: 'Kiến Thức Dinh Dưỡng', href: '/blog' },
    { label: 'Tra Cứu Đơn Hàng', href: '/orders' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-xl border-b border-black/[0.08] transition-all">
        <Container className="h-full flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative h-8 w-36 sm:w-44">
              <Image
                src="/logo-brand.webp"
                alt="Whey4You Fuel Your Goal"
                fill
                priority
                quality={90}
                sizes="(max-width: 640px) 144px, 176px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Center Navigation Links (Matching User Design) */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-apple-dark">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? 'text-apple-blue'
                      : 'hover:text-apple-blue'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons: Search + Cart */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm"
              className="p-1.5 text-apple-dark hover:text-apple-blue transition-colors rounded-full hover:bg-black/[0.04]"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={openCart}
              aria-label="Giỏ hàng"
              className="relative p-1.5 text-apple-dark hover:text-apple-blue transition-colors rounded-full hover:bg-black/[0.04]"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-1 bg-apple-blue text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-apple-dark"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </nav>

      {/* Mobile Drawer Dropdown & Backdrop (Outside nav to escape backdrop-filter containing block) */}
      {mobileOpen && (
        <div className="lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Menu Panel with solid white background */}
          <div className="fixed top-16 inset-x-0 w-full bg-white border-b border-black/[0.08] px-6 py-4 space-y-1 z-50 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm py-3 border-b border-black/[0.05] last:border-0 transition-colors ${
                    isActive
                      ? 'text-apple-blue font-bold'
                      : 'text-apple-dark hover:text-apple-blue font-semibold'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
