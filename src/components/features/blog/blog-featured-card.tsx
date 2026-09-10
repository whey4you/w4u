import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { parseInlineFormatting } from './markdown-parser';

interface BlogFeaturedCardProps {
  post: BlogPost;
}

export function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] lg:min-h-[420px]">
        {/* Story Media with Ambient Gradient */}
        <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-7 bg-stone-950 overflow-hidden">
          <Image
            src={post.image || '/blogs/whey-timing.jpg'}
            alt={post.title}
            fill
            priority
            quality={85}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
          
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-blue-700 shadow-sm border border-white/40">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {post.category}
            </span>
          </div>
        </div>

        {/* Story Editorial Body */}
        <div className="p-6 sm:p-8 lg:p-10 lg:col-span-5 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                {post.readTime}
              </span>
              <span>•</span>
              <span>{post.date || 'Mới cập nhật'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 group-hover:text-blue-700 transition-colors duration-300 leading-snug tracking-tight">
              {post.title}
            </h2>

            <div className="text-sm sm:text-base text-stone-600 leading-relaxed line-clamp-3">
              {parseInlineFormatting(post.excerpt)}
            </div>
          </div>

          {/* Author & Read Action */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
                {post.author ? post.author.name.charAt(0) : 'W'}
              </div>
              <div className="text-xs leading-tight">
                <p className="font-semibold text-stone-900">
                  {post.author?.name || 'WHEY4YOU'}
                </p>
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  Đã thẩm định y khoa
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 group-hover:translate-x-1.5 transition-transform duration-300">
              Đọc toàn văn
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
