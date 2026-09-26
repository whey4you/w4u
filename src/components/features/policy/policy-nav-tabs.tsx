import React from 'react';
import Link from 'next/link';
import { getAllPolicies } from '@/data/policies';
import { RotateCcw, Truck, FileText, ShieldCheck } from 'lucide-react';

interface PolicyNavTabsProps {
  currentSlug: string;
}

const ICON_MAP = {
  RotateCcw,
  Truck,
  FileText,
  ShieldCheck,
};

export function PolicyNavTabs({ currentSlug }: PolicyNavTabsProps) {
  const policies = getAllPolicies();

  return (
    <nav className="flex flex-wrap gap-2 py-3 border-b border-neutral-200/80 mb-6 sm:mb-8" aria-label="Danh mục chính sách">
      {policies.map((policy) => {
        const Icon = ICON_MAP[policy.iconName] || FileText;
        const isActive = policy.slug === currentSlug;

        return (
          <Link
            key={policy.slug}
            href={`/policy/${policy.slug}`}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              isActive
                ? 'bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900'
                : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 border border-neutral-200/80'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
            <span>{policy.shortTitle}</span>
          </Link>
        );
      })}
    </nav>
  );
}
