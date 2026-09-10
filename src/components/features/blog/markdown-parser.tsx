import React from 'react';

export function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null;

  // Loại bỏ hoàn toàn tất cả ký tự '#' và ký tự trích dẫn '>' đầu câu để đảm bảo Markdown sạch sẽ
  const cleanInput = text
    .replace(/#+/g, '')
    .replace(/^>\s*/, '')
    .trim();

  if (!cleanInput) return null;

  // Split by bold-italic (***text***, ___text___), bold (**text**, __text__), italic (*text*, _text_), code (`text`), link ([text](url))
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*.*?\*\*\*|___.*?___|\*\*.*?\*\*|__.*?__|\*[^*]+?\*|_[^_]+?_|`.*?`|\[.*?\]\(.*?\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanInput)) !== null) {
    if (match.index > lastIdx) {
      parts.push(cleanInput.substring(lastIdx, match.index));
    }
    const token = match[0];

    if ((token.startsWith('***') && token.endsWith('***')) || (token.startsWith('___') && token.endsWith('___'))) {
      parts.push(
        <strong key={match.index} className="font-bold italic text-slate-900">
          {token.slice(3, -3)}
        </strong>
      );
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      parts.push(
        <em key={match.index} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 text-blue-600 font-mono text-xs">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-medium underline hover:text-blue-700"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < cleanInput.length) {
    parts.push(cleanInput.substring(lastIdx));
  }

  return parts.length > 0 ? parts : cleanInput;
}

export function slugifyHeading(text: string): string {
  const clean = text.replace(/[*_`#]/g, '').trim();
  return clean
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
