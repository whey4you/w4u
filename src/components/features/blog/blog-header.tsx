'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Clock, Calendar, ShieldCheck, Share2, Check } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { parseInlineFormatting } from './markdown-parser';

interface BlogHeaderProps {
  post: BlogPost;
}

export function BlogHeader({ post }: BlogHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  return (
    <header className="pt-6 sm:pt-10 pb-6 sm:pb-8">
      {/* 1. Breadcrumbs Báo Chí Tối Giản */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500 font-medium">
          <li>
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Trang chủ
            </Link>
          </li>
          <li><ChevronRight className="h-3 w-3 text-stone-400" /></li>
          <li>
            <Link href="/blog" className="hover:text-stone-900 transition-colors">
              Chuyên khảo Khoa học
            </Link>
          </li>
          <li><ChevronRight className="h-3 w-3 text-stone-400" /></li>
          <li className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {post.category}
          </li>
        </ol>
      </nav>


      {/* 3. Tiêu Đề Bài Báo Căn Giữa */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] font-extrabold text-stone-950 leading-[1.2] tracking-tight mb-4 sm:mb-5 text-center max-w-5xl mx-auto">
        {post.title}
      </h1>

      {/* 4. Đoạn Mô Tả Dưới Tiêu Đề Căn Giữa */}
      {post.excerpt && (
        <div className="w-full text-center text-base sm:text-lg lg:text-xl text-stone-600 font-normal leading-relaxed max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
          {parseInlineFormatting(post.excerpt)}
        </div>
      )}

      {/* 5. Thanh Byline Thẩm Định Y Khoa */}
      <div className="border-y border-stone-200 py-3.5 my-6 sm:my-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden ring-1 ring-stone-200">
            {post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span>{post.author ? post.author.name.charAt(0) : 'W'}</span>
            )}
          </div>
          <div className="text-xs leading-tight space-y-1">
            <div className="flex items-center flex-wrap gap-x-2 text-stone-900">
              <span>
                Tác giả:{' '}
                <strong className="font-semibold text-stone-950">
                  {post.author?.name || 'WHEY4YOU'}
                </strong>
              </span>
              {post.author?.role && (
                <span className="text-stone-500">({post.author.role})</span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-1.5 text-stone-600">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Thẩm định y khoa:
              </span>
              <span className="font-medium text-stone-800">
                Hội đồng Khoa học Thể thao & Dinh dưỡng Whey4You
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs text-stone-500 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 w-full md:w-auto justify-between md:justify-end">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            {post.readTime}
          </span>
          <span className="text-stone-300">•</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-stone-400" />
            {post.date || 'Cập nhật hôm nay'}
          </span>
          <span className="text-stone-300">•</span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-stone-700 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
            title="Sao chép liên kết bài viết"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Đã chép link</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-stone-500" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6. Khung Ảnh Bìa Toàn Cảnh Giữ Nguyên Tỉ Lệ Gốc */}
      <figure className="mt-4 sm:mt-6">
        <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100/80 border border-stone-200/90 shadow-sm flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image || '/blogs/whey-timing.jpg'}
            alt={post.title}
            className="w-auto max-w-full h-auto object-contain mx-auto rounded-xl sm:rounded-2xl"
          />
        </div>
      </figure>
    </header>
  );
}

