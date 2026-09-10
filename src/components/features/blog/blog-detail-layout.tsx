'use client';

import React, { useMemo } from 'react';
import { BlogPost } from '@/types/blog';
import { BlogToc, TocItem } from './blog-toc';
import { BlogKeyTakeaways } from './blog-key-takeaways';
import { BlogMobileToc } from './blog-mobile-toc';
import { BlogContentRenderer } from './blog-content-renderer';
import { BlogSidebarCommerce } from './blog-sidebar-commerce';
import { BlogMobileBottomBar } from './blog-mobile-bottom-bar';
import { slugifyHeading, parseInlineFormatting } from './markdown-parser';

interface BlogDetailLayoutProps {
  post: BlogPost;
}

export function BlogDetailLayout({ post }: BlogDetailLayoutProps) {
  // Extract TOC items from content
  const tocItems: TocItem[] = useMemo(() => {
    if (!post.content) return [];
    const lines = post.content.split('\n');
    const items: TocItem[] = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      const headingMatch = trimmed.match(/^(#{1,6})\s*(.*?)\s*#*$/);
      if (headingMatch) {
        const level = Math.min(Math.max(headingMatch[1].length, 2), 4);
        const rawTitle = headingMatch[2].replace(/#+/g, '').trim();
        const cleanTitle = rawTitle.replace(/[*_`]/g, '').trim();
        if (cleanTitle) {
          items.push({ id: slugifyHeading(rawTitle), title: cleanTitle, level });
        }
      }
    });
    return items;
  }, [post.content]);

  const primaryProductId = post.relatedProductIds?.[0];

  return (
    <div className="pt-1 sm:pt-2 pb-8 sm:pb-12 relative">
      {/* 7/3 Ratio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 xl:gap-10 items-start">
        {/* Left Column (7 Parts - 70%): Full Article Content */}
        <div className="col-span-1 lg:col-span-7 min-w-0">
          <BlogKeyTakeaways takeaways={post.keyTakeaways} />
          <BlogMobileToc items={tocItems} />
          {post.content ? (
            <BlogContentRenderer content={post.content} />
          ) : (
            <p className="text-slate-600 leading-relaxed">{parseInlineFormatting(post.excerpt)}</p>
          )}
        </div>

        {/* Right Column (3 Parts - 30%): Sticky Sidebar (TOC + Commerce Hub) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-0.5">
          <BlogToc items={tocItems} />
          <BlogSidebarCommerce productIds={post.relatedProductIds} />
        </aside>
      </div>

      {/* Mobile Sticky Action Bar */}
      <BlogMobileBottomBar productId={primaryProductId} />
    </div>
  );
}
