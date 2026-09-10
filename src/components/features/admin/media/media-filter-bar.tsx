'use client';

import React from 'react';
import { Search, X, Layers, Image as ImageIcon, Package, SlidersHorizontal, BookOpen } from 'lucide-react';
import { MediaCategory } from '@/types/media';

interface MediaFilterBarProps {
  currentCategory: MediaCategory;
  onSelectCategory: (cat: MediaCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: Record<MediaCategory, number>;
}

const CATEGORY_TABS: { id: MediaCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Tất Cả', icon: Layers },
  { id: 'custom', label: 'Tự Thêm', icon: ImageIcon },
  { id: 'product', label: 'Sản Phẩm', icon: Package },
  { id: 'banner', label: 'Banner', icon: SlidersHorizontal },
  { id: 'blog', label: 'Blog', icon: BookOpen },
];

export function MediaFilterBar({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  counts,
}: MediaFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentCategory === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative min-w-[240px] sm:w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên ảnh, sản phẩm, URL..."
          className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-500 focus:outline-hidden text-slate-900 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
