'use client';

import React from 'react';
import { BlogInlineProduct } from './blog-inline-product';
import { BlogInlineImage } from './blog-inline-image';
import { BlogTableRenderer } from './blog-table-renderer';
import { parseInlineFormatting, slugifyHeading } from './markdown-parser';
import { Quote } from 'lucide-react';

interface BlogContentRendererProps {
  content: string;
}

export function BlogContentRenderer({ content }: BlogContentRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentTable: string[] = [];

  const flushParagraph = (key: string | number) => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').replace(/#+/g, '').trim();
      if (text) {
        elements.push(
          <p key={`p-${key}`} className="text-slate-700 text-base sm:text-[17px] leading-[1.8] mb-5 font-normal">
            {parseInlineFormatting(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushTable = (key: string | number) => {
    if (currentTable.length > 0) {
      elements.push(<BlogTableRenderer key={`table-${key}`} tableLines={currentTable} />);
      currentTable = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Bỏ qua các dòng chỉ chứa toàn dấu '#' (như '###', '####') không có chữ
    if (/^#+\s*$/.test(trimmed)) {
      flushParagraph(idx);
      return;
    }

    // 1. Check for Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph(idx);
      currentTable.push(trimmed);
      return;
    }
    flushTable(idx);

    // 2. Inline Product Tag: :::product{id="..."}:::
    const productMatch = trimmed.match(/^:::product\{id=["'](.*?)["']\}:::$/);
    if (productMatch) {
      flushParagraph(idx);
      elements.push(<BlogInlineProduct key={`prod-${idx}`} productId={productMatch[1]} />);
      return;
    }

    // 3. Inline Image: ![caption](url) hoặc :::image{src="..." caption="..."}:::
    const mdImageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (mdImageMatch) {
      flushParagraph(idx);
      elements.push(
        <BlogInlineImage
          key={`img-${idx}`}
          caption={mdImageMatch[1]}
          alt={mdImageMatch[1]}
          src={mdImageMatch[2]}
        />
      );
      return;
    }

    const directiveImageMatch = trimmed.match(
      /^:::image\{src=["'](.*?)["'](?:\s+caption=["'](.*?)["'])?(?:\s+alt=["'](.*?)["'])?\}:::$/
    );
    if (directiveImageMatch) {
      flushParagraph(idx);
      elements.push(
        <BlogInlineImage
          key={`dir-img-${idx}`}
          src={directiveImageMatch[1]}
          caption={directiveImageMatch[2]}
          alt={directiveImageMatch[3] || directiveImageMatch[2]}
        />
      );
      return;
    }

    // 3. Headings (H1 đến H6) - Bắt tất cả mức độ và xóa sạch dấu '#'
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.*?)\s*#*$/);
    if (headingMatch) {
      flushParagraph(idx);
      const level = headingMatch[1].length;
      const title = headingMatch[2].replace(/#+/g, '').trim();
      if (!title) return; // Nếu sau khi xóa hash mà không còn chữ thì bỏ qua
      const id = slugifyHeading(title);

      if (level >= 4) {
        elements.push(
          <h4
            key={`h4-${idx}`}
            id={id}
            className="text-base sm:text-lg font-bold text-apple-dark tracking-tight mt-6 mb-2 scroll-mt-20"
          >
            {parseInlineFormatting(title)}
          </h4>
        );
      } else if (level === 3) {
        elements.push(
          <h3
            key={`h3-${idx}`}
            id={id}
            className="text-lg sm:text-xl font-bold text-apple-dark tracking-tight mt-7 mb-3 scroll-mt-20"
          >
            {parseInlineFormatting(title)}
          </h3>
        );
      } else {
        // level 1 hoặc 2 -> render thành H2 chuẩn SEO
        elements.push(
          <h2
            key={`h2-${idx}`}
            id={id}
            className="text-2xl sm:text-3xl font-bold text-apple-dark tracking-tight mt-10 mb-4 pt-4 border-t border-slate-100 scroll-mt-20"
          >
            {parseInlineFormatting(title)}
          </h2>
        );
      }
      return;
    }

    // 5. Blockquotes (Xóa sạch '#' trong trích dẫn)
    if (trimmed.startsWith('>')) {
      flushParagraph(idx);
      const quoteText = trimmed.replace(/^>\s*/, '').replace(/#+/g, '').trim();
      if (quoteText) {
        elements.push(
          <blockquote
            key={`quote-${idx}`}
            className="my-6 rounded-2xl border-l-4 border-apple-blue bg-blue-50/40 p-4 sm:p-5 flex items-start gap-3.5"
          >
            <Quote className="h-6 w-6 text-apple-blue shrink-0 mt-1 opacity-60" />
            <div className="text-sm sm:text-base text-slate-700 italic leading-relaxed">
              {parseInlineFormatting(quoteText)}
            </div>
          </blockquote>
        );
      }
      return;
    }

    // 6. Divider
    if (trimmed === '---') {
      flushParagraph(idx);
      elements.push(<hr key={`hr-${idx}`} className="my-8 border-slate-200/80" />);
      return;
    }

    // 7. List items (Xóa sạch '#' trong mục danh sách)
    if (trimmed.startsWith('- ') || trimmed.match(/^\d+\.\s/)) {
      flushParagraph(idx);
      const itemText = trimmed.replace(/^(-\s+|\d+\.\s+)/, '').replace(/#+/g, '').trim();
      if (itemText) {
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-3 my-2 text-slate-700 text-base leading-relaxed pl-2">
            <span className="h-1.5 w-1.5 rounded-full bg-apple-blue mt-2.5 shrink-0" />
            <div>{parseInlineFormatting(itemText)}</div>
          </div>
        );
      }
      return;
    }

    // Blank line indicates paragraph boundary
    if (!trimmed) {
      flushParagraph(idx);
      return;
    }

    currentParagraph.push(trimmed);
  });

  flushParagraph('final');
  flushTable('final');

  return <article className="prose-apple max-w-none">{elements}</article>;
}
