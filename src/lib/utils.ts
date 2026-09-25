import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0\u00A0đ';
  return `${Math.round(amount).toLocaleString('en-US')}\u00A0đ`;
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

/**
 * Phân tích khối lượng sản phẩm (kg) dựa trên tên kích cỡ hoặc tên sản phẩm.
 * Hỗ trợ các định dạng kg, lbs, gram. Nếu là viên/servings/ngày thì mặc định fallback = 1.0kg.
 */
export function parseWeightKg(str?: string | null, fallback = 1.0): number {
  if (!str || typeof str !== 'string') return fallback;
  const s = str.toLowerCase().trim();

  // Match kg: e.g. "2,56kg", "2.56 kg", "3kg", "1 kg"
  const kgMatch = s.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kí)\b/);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) return Number(val.toFixed(2));
  }

  // Match lbs: e.g. "5 lbs", "10 lbs", "2.2 lbs"
  const lbsMatch = s.match(/(\d+(?:[.,]\d+)?)\s*(?:lbs|lb)\b/);
  if (lbsMatch) {
    const val = parseFloat(lbsMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Number((val * 0.453592).toFixed(2));
    }
  }

  // Match gram: e.g. "648 gram", "907g", "500 g"
  const gMatch = s.match(/(\d+(?:[.,]\d+)?)\s*(?:gram|grams|g)\b/);
  if (gMatch) {
    const val = parseFloat(gMatch[1].replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      return Number((val / 1000).toFixed(2));
    }
  }

  return fallback;
}

