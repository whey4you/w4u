import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { parseInlineFormatting } from './markdown-parser';

interface BlogKeyTakeawaysProps {
  takeaways?: string[];
}

export function BlogKeyTakeaways({ takeaways }: BlogKeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <aside
      aria-label="Tóm tắt nhanh bài viết"
      className="mt-1 sm:mt-2 mb-8 rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 border border-apple-blue/15 shadow-2xs"
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-apple-blue text-white shadow-xs">
          <Zap className="h-4 w-4 fill-white" />
        </span>
        <h2 className="text-sm sm:text-base font-semibold text-apple-dark">
          Tóm Tắt Nhanh Trong 30 Giây (Key Takeaways)
        </h2>
      </div>

      <ul className="space-y-2.5">
        {takeaways.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <CheckCircle2 className="h-4 w-4 text-apple-blue shrink-0 mt-0.5" />
            <span className="flex-1">{parseInlineFormatting(item)}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
