import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function AppleButton({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: AppleButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-apple-blue text-white hover:bg-apple-blue-hover shadow-xs',
    secondary: 'bg-[#e8e8ed] text-apple-dark hover:bg-[#d8d8dd]',
    dark: 'bg-apple-dark text-white hover:bg-[#333336]',
    outline: 'border border-apple-blue text-apple-blue hover:bg-apple-blue/5',
  };

  const sizes = {
    sm: 'text-xs px-4 py-1.5 min-h-[32px]',
    md: 'text-sm px-5 py-2.5 min-h-[40px]',
    lg: 'text-base px-6 py-3 min-h-[46px] font-semibold',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function AppleLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-normal text-apple-blue hover:underline group',
        className
      )}
    >
      <span>{children}</span>
      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
