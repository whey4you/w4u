'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const quickSearches = [
    'Whey Protein',
    'Verifyst',
    'Creatine',
    'Vitamins',
    'Tăng Cơ Nạc',
    'Tăng Cân',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-black/[0.08] relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearch} className="relative mt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            autoFocus
            className="w-full pl-12 pr-4 py-3 text-base rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-apple-blue focus:bg-white transition-all text-apple-dark"
          />
        </form>

        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Tìm kiếm phổ biến
          </p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  router.push(`/products?q=${encodeURIComponent(term)}`);
                  onClose();
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-apple-blue/10 hover:text-apple-blue text-slate-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
