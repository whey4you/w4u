import { NutritionTableRow } from '@/types/product';

export interface ParsedMetric {
  prefix: string;
  num: number;
  unit: string;
}

/**
 * Trích xuất tiền tố (~, <), số và đơn vị từ chuỗi (vd: "25g", "~110 kcal", "500mg", "100%")
 */
export function parseMetricValue(val: string): ParsedMetric | null {
  if (!val) return null;
  const trimmed = val.trim();
  const match = trimmed.match(/^([~<>≈\s]*)?([\d.,]+)\s*([a-zA-Z%]*)$/);
  if (!match) return null;

  const prefix = (match[1] || '').trim();
  const numStr = match[2].replace(',', '.');
  const num = parseFloat(numStr);
  if (isNaN(num)) return null;

  const unit = match[3] || 'g';
  return { prefix, num, unit };
}

/**
 * Tính giá trị trên 100g dựa vào giá trị 1 lần dùng và khối lượng 1 muỗng (scoop in grams)
 */
export function calculatePer100g(perServing: string, scoopGrams: number): string {
  if (!perServing || !scoopGrams || scoopGrams <= 0) return '';

  const parsed = parseMetricValue(perServing);
  if (!parsed) return '';

  // Đơn vị phần trăm (%) giữ nguyên
  if (parsed.unit === '%') {
    return `${parsed.num}%`;
  }

  // Quy đổi theo công thức: (giá trị mỗi lần dùng / scoopGrams) * 100
  const val100g = (parsed.num / scoopGrams) * 100;

  // Làm tròn đẹp: nếu là số nguyên thì không cần thập phân, nếu có lẻ thì lấy 1 chữ số thập phân
  const rounded = Number.isInteger(val100g)
    ? val100g.toString()
    : (Math.round(val100g * 10) / 10).toString();

  const isApprox = parsed.prefix.includes('~') || !Number.isInteger(val100g);
  const prefixStr = isApprox ? '~' : '';

  const unitStr = parsed.unit === 'kcal' || parsed.unit === 'Cal'
    ? ` ${parsed.unit}`
    : (parsed.unit || 'g');

  return `${prefixStr}${rounded}${unitStr}`;
}

/**
 * Tự động tính toán lại toàn bộ bảng thành phần chi tiết
 */
export function calculateAllRowsPer100g(
  rows: NutritionTableRow[],
  scoopGrams: number
): NutritionTableRow[] {
  if (!scoopGrams || scoopGrams <= 0) return rows;

  return rows.map((row) => {
    const computed100g = calculatePer100g(row.perServing, scoopGrams);
    return {
      ...row,
      per100g: computed100g || row.per100g || '',
    };
  });
}

/**
 * Tính tỷ lệ % protein (độ tinh khiết) từ giá trị protein và số gram 1 scoop
 */
export function calculateProteinPurity(proteinVal: string, scoopGrams: number): number | null {
  if (!proteinVal || !scoopGrams || scoopGrams <= 0) return null;
  const parsed = parseMetricValue(proteinVal);
  if (!parsed || parsed.num <= 0) return null;

  const purity = (parsed.num / scoopGrams) * 100;
  return Math.round(purity * 10) / 10;
}
