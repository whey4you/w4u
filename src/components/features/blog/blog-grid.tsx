'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Clock, ArrowUpRight, X } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { BlogPost } from '@/types/blog';
import { parseInlineFormatting } from './markdown-parser';

const CATEGORIES = ['Tất cả', 'Khoa Học', 'Dinh Dưỡng', 'Tập Luyện', 'Review'] as const;

interface BlogGridProps {
  posts?: BlogPost[];
}

export function BlogGrid({ posts: customPosts }: BlogGridProps) {
  const allPosts = customPosts || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchCategory =
        selectedCategory === 'Tất cả' || post.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  return (
    <section className="py-8 sm:py-12">
      <Container>
        {/* Modern Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200/80">
          {/* Category Segmented Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs scale-102'
                      : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-full border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Section Heading & Counter */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
            Tất Cả Bài Viết
          </h3>
          <span className="text-xs font-medium text-stone-500">
            {filteredPosts.length} bài viết
          </span>
        </div>

        {/* Posts Bento Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-lg hover:border-blue-500/30 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                  <Image
                    src={post.image || '/blogs/whey-timing.jpg'}
                    alt={post.title}
                    fill
                    quality={85}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-blue-700 shadow-xs border border-white/60">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                    <div className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {parseInlineFormatting(post.excerpt)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 group-hover:text-blue-700 transition-colors">
                      Đọc tiếp
                    </span>
                    <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200/80">
            <p className="text-stone-500 text-sm">
              Không tìm thấy bài viết phù hợp với tiêu chí của bạn.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-semibold text-blue-700 hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
