/**
 * Tự động phân tích và trích xuất khối lượng (kg) từ tên kích cỡ / quy cách.
 * Hỗ trợ các đơn vị:
 * - kg / kilo (VD: "2,56kg", "2.56 kg", "1kg") -> lấy trực tiếp số kg
 * - lbs / lb / pound (VD: "5lbs", "2 lbs", "10 lbs") -> đổi sang kg (1 lbs ~ 0.4536 kg)
 * - gram / g / gr (VD: "300g", "500 gram", "900 gr") -> đổi sang kg (/1000)
 *
 * Nếu là viên, serving, gói... hoặc không chứa đơn vị trọng lượng -> trả về null để người dùng tự nhập.
 */
export function parseWeightKgFromText(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();

  // 1. Kiểm tra đơn vị kg (VD: 2,56kg, 2.5kg, 1 kg)
  const kgMatch = clean.match(/(?:^|[^\w.])(\d+(?:[.,]\d+)?)\s*(?:kg|kilo|kilogram)s?(?:[^\w.]|$)/i);
  if (kgMatch) {
    const num = parseFloat(kgMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) return Math.round(num * 100) / 100;
  }

  // 2. Kiểm tra đơn vị lbs / lb (VD: 5lbs, 2 lbs, 10 lbs)
  const lbsMatch = clean.match(/(?:^|[^\w.])(\d+(?:[.,]\d+)?)\s*(?:lbs|lb|pound)s?(?:[^\w.]|$)/i);
  if (lbsMatch) {
    const num = parseFloat(lbsMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      return Math.round(num * 0.453592 * 100) / 100;
    }
  }

  // 3. Kiểm tra đơn vị gram / g / gr (VD: 300g, 500gram, 900gr)
  const gMatch = clean.match(/(?:^|[^\w.])(\d+(?:[.,]\d+)?)\s*(?:gram|gramme|gr|g)s?(?:[^\w.]|$)/i);
  if (gMatch) {
    const num = parseFloat(gMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      return Math.round((num / 1000) * 100) / 100;
    }
  }

  return null;
}
