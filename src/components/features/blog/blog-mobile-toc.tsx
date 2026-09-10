'use client';

import React, { useState, useEffect } from 'react';
import { ListCollapse, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TocItem } from './blog-toc';

interface BlogMobileTocProps {
  items: TocItem[];
}

export function BlogMobileToc({ items }: BlogMobileTocProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      const offset = 70;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Mục lục bài viết trên thiết bị di động"
      className="lg:hidden my-6 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-1"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <ListCollapse className="h-4 w-4 text-apple-blue shrink-0" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Mục Lục Bài Viết
          </span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {items.length} phần
          </span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180 text-apple-blue'
          )}
        />
      </button>

      {isOpen && (
        <ul className="mt-3 pt-3 border-t border-slate-100 space-y-1 border-l border-slate-200 pl-2 max-h-64 overflow-y-auto pr-1">
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
                    'block py-1.5 px-2 text-xs leading-snug rounded-md break-words',
                    isActive
                      ? 'border-l-2 border-apple-blue font-semibold text-apple-blue bg-blue-50/70'
                      : 'text-slate-600 active:text-slate-900 active:bg-slate-50'
                  )}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
