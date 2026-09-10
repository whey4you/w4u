'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { prepareChatContent } from './chat-content';
import { ChatProductCarousel } from './chat-product-carousel';

interface ChatMarkdownProps {
  content: string;
  isStreaming?: boolean;
  onSelectSuggestion?: (query: string) => void;
}

/**
 * Component render Markdown chuẩn Tailwind & ReactMarkdown,
 * tối ưu typography, an toàn bảo mật, và đưa thẻ sản phẩm xuống dưới cùng.
 */
export function ChatMarkdown({
  content,
  isStreaming = false,
  onSelectSuggestion,
}: ChatMarkdownProps) {
  const { text: cleanText, productIds, suggestions } = prepareChatContent(content, isStreaming);

  return (
    <div className="space-y-1.5 leading-relaxed text-[12.5px] text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (!href || /^javascript:/i.test(href)) {
              return <span>{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-600 underline hover:text-brand-700 transition"
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700 border-b border-slate-200 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 border-b border-slate-100 text-slate-600">
              {children}
            </td>
          ),
          h1: ({ children }) => (
            <h3 className="font-bold text-slate-900 text-[13.5px] mt-2 mb-1">{children}</h3>
          ),
          h2: ({ children }) => (
            <h4 className="font-bold text-slate-900 text-[13px] mt-1.5 mb-1">{children}</h4>
          ),
          h3: ({ children }) => (
            <h5 className="font-bold text-slate-900 text-[12.5px] mt-1 mb-0.5">{children}</h5>
          ),
          ul: ({ children }) => <ul className="my-1 space-y-1 list-disc pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 space-y-1 list-decimal pl-4">{children}</ol>,
          li: ({ children }) => <li className="text-[12.5px] text-slate-700">{children}</li>,
          p: ({ children }) => <p className="text-[12.5px] text-slate-800 my-1">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
        }}
      >
        {cleanText}
      </ReactMarkdown>

      {productIds.length > 0 && <ChatProductCarousel productIds={productIds} />}

      {suggestions.length > 0 && onSelectSuggestion && (
        <div className="mt-2.5 pt-2 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Gợi ý hỏi tiếp:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggestion(s)}
                className="rounded-full border border-blue-200/80 bg-brand-50/50 px-2.5 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition shadow-2xs text-left"
              >
                💬 {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
