import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogRelatedPostsProps {
  currentSlug: string;
  posts?: BlogPost[];
}

export function BlogRelatedPosts({ currentSlug, posts: customPosts }: BlogRelatedPostsProps) {
  const pool = customPosts || [];
  const related = pool.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-slate-200/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-apple-dark">
            Bài Viết Liên Quan
          </h2>
          <p className="text-xs text-apple-subhead mt-1">
            Nâng cao kiến thức cùng chuyên gia dinh dưỡng Whey4You
          </p>
        </div>
        <Link
          href="/blog"
          className="text-xs font-semibold text-apple-blue hover:underline inline-flex items-center gap-0.5"
        >
          Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-apple-dark">
                {post.category}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  {post.readTime} • {post.date}
                </span>
                <h3 className="text-sm font-semibold text-apple-dark group-hover:text-apple-blue transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
              </div>
              <span className="mt-3 text-xs font-semibold text-apple-blue inline-flex items-center gap-1 group-hover:underline">
                Đọc tiếp →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
