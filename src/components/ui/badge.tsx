import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'secondary' | 'discount' | 'neutral';
  children: React.ReactNode;
}

export function Badge({
  className,
  variant = 'neutral',
  children,
  ...props
}: BadgeProps) {
  const base =
    'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded tracking-wide';

  const variants = {
    brand: 'bg-brand-50 text-brand-700 border border-brand-200',
    secondary: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    discount: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
