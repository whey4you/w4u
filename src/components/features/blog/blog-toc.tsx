'use client';

import React, { useEffect, useState } from 'react';
import { ListCollapse } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface BlogTocProps {
  items: TocItem[];
}

export function BlogToc({ items }: BlogTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: '-80px 0% -60% 0%', threshold: 0.1 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Mục lục bài viết"
      className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          <ListCollapse className="h-3.5 w-3.5 text-apple-blue shrink-0" />
          <span>Mục Lục Bài Viết</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {items.length} phần
        </span>
      </div>

      <ul className="space-y-0.5 border-l border-slate-200 pl-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={cn(
                'transition-all duration-200 -ml-[9px]',
                item.level === 3 ? 'pl-2.5' : 'pl-0'
              )}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollTo(e, item.id)}
                className={cn(
                  'block py-1 px-2 text-[11.5px] sm:text-xs leading-snug transition-all rounded-r-md break-words',
                  isActive
                    ? 'border-l-2 border-apple-blue font-semibold text-apple-blue bg-blue-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
                title={item.title}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
