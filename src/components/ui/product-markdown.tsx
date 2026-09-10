'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface ProductMarkdownProps {
  content?: string | null;
  className?: string;
  fallback?: string;
}

export function ProductMarkdown({
  content,
  className,
  fallback = '',
}: ProductMarkdownProps) {
  const text = (content || fallback || '').trim();

  if (!text) return null;

  return (
    <div className={cn('text-sm text-slate-700 leading-relaxed product-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
          ul: ({ children }) => <ul className="my-2 space-y-1 list-disc pl-4 text-slate-600">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal pl-4 text-slate-600">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h3 className="font-bold text-slate-900 text-base mt-3 mb-1">{children}</h3>,
          h2: ({ children }) => <h4 className="font-bold text-slate-900 text-sm mt-2.5 mb-1">{children}</h4>,
          h3: ({ children }) => <h5 className="font-bold text-slate-900 text-xs mt-2 mb-1">{children}</h5>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 border-b border-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-slate-100 text-slate-600">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 pl-3 italic text-slate-600 my-2 bg-blue-50/30 py-1 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            if (!href || /^javascript:/i.test(href)) {
              return <span>{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline hover:text-blue-700 transition"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
