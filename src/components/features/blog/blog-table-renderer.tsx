import React from 'react';
import { parseInlineFormatting } from './markdown-parser';

interface BlogTableRendererProps {
  tableLines: string[];
}

export function BlogTableRenderer({ tableLines }: BlogTableRendererProps) {
  if (!tableLines.length) return null;

  const rows = tableLines.map((line) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.replace(/#+/g, '').trim())
  );

  const headers = rows[0] || [];
  const isSeparator = (r: string[]) => r.every((cell) => /^:?-+:?$/.test(cell.replace(/\s+/g, '')));
  const dataRows = rows.slice(1).filter((r) => !isSeparator(r));

  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
      <table className="w-full text-left text-xs sm:text-sm text-slate-700">
        {headers.length > 0 && (
          <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px] sm:text-xs">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="p-3.5 sm:p-4 whitespace-nowrap sm:whitespace-normal font-semibold">
                  {parseInlineFormatting(h)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-3.5 sm:p-4 leading-relaxed">
                  {parseInlineFormatting(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
