import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 đ';
  return `${Math.round(amount).toLocaleString('en-US')} đ`;
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractProductIdsFromContent(content?: string): string[] {
  if (!content) return [];
  const regex = /:::product\{id=["'](.*?)["']\}:::/g;
  const ids = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1]?.trim();
    if (id && !id.includes('id-san-pham')) {
      ids.add(id);
    }
  }
  return Array.from(ids);
}

