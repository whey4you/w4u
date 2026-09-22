import { NutritionTableRow } from '@/types/product';
import { parseMetricValue } from './nutrition-calculator';

export interface ExtractedHighlightMetrics {
  protein: string;
  proteinLabel?: string;
  bcaa: string;
  bcaaLabel?: string;
  calories: string;
  caloriesLabel?: string;
  sugar: string;
  sugarLabel?: string;
  servings: string;
  servingsLabel?: string;
}

/**
 * Làm sạch chuỗi servings thành số nguyên chuẩn (loại bỏ "servings", "lần", "about"...)
 * Tránh lỗi rỗng form khi gán vào <input type="number">
 */
export function cleanServingCount(raw?: string | number | null): string {
  if (raw === undefined || raw === null) return '';
  if (typeof raw === 'number') return Math.round(raw).toString();

  const str = String(raw).trim();
  // Tìm cụm số nguyên đầu tiên
  const match = str.match(/\b\d+\b/);
  if (match) return match[0];

  const parsed = parseMetricValue(str);
  if (parsed && parsed.num > 0) return Math.round(parsed.num).toString();

  return '';
}

/**
 * Chuẩn hóa giá trị Calo, giữ nguyên số thập phân (vd: "0.9 kcal") hoặc số nguyên
 */
export function cleanCaloriesValue(raw?: string | null): string {
  if (!raw) return '';
  const str = String(raw).trim();
  const match = str.match(/^([~<>≈\s]*)?([\d.,]+)\s*([a-zA-Z]*)/);
  if (match) {
    const num = match[2].replace(',', '.');
    const unit = match[3] || '';
    if (!num.includes('.')) {
      return num;
    }
    return `${num}${unit ? ' ' + unit : ' kcal'}`.trim();
  }
  return str;
}

function findRowByName(rows: NutritionTableRow[], keywords: string[]): NutritionTableRow | undefined {
  return rows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return keywords.some((kw) => nameLower.includes(kw));
  });
}

/**
 * Trích xuất chuẩn xác 5 thông số nổi bật từ Bảng Thành Phần Chi Tiết (nutritionTable)
 */
export function extractHighlightMetricsFromTable(
  rows: NutritionTableRow[],
  category = 'whey'
): ExtractedHighlightMetrics {
  if (!rows || rows.length === 0) {
    return {
      protein: '25g',
      proteinLabel: 'Protein / Lần Dùng',
      bcaa: '6.0g',
      bcaaLabel: 'Hàm Lượng BCAA',
      calories: '110',
      caloriesLabel: 'Năng Lượng',
      sugar: '0g',
      sugarLabel: 'Hàm Lượng Đường',
      servings: '70',
      servingsLabel: 'Số Lần Dùng',
    };
  }

  // 1. Tìm dòng servings / quy cách
  const servingsRow = rows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return ['servings per container', 'lần dùng', 'khẩu phần', 'quy cách', 'số lần', 'viên'].some((kw) =>
      nameLower.includes(kw)
    );
  });
  const extractedServings = cleanServingCount(servingsRow?.perServing);
  const isCapsule = category === 'vitamins' || (servingsRow?.name && servingsRow.name.toLowerCase().includes('viên'));
  const servingsLabel = isCapsule ? 'Quy Cách (Viên)' : 'Số Lần Dùng';

  // 2. Tìm dòng calories / năng lượng
  const caloriesRow = rows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return ['calorie', 'calo', 'năng lượng', 'energy'].some((kw) => nameLower.includes(kw));
  });
  const cleanedCalories = caloriesRow ? cleanCaloriesValue(caloriesRow.perServing) : '';

  // 3. Lọc ra các dòng hoạt chất / dinh dưỡng thực tế (loại bỏ dòng servings và calories)
  const nutrientRows = rows.filter((r) => {
    const nameLower = (r.name || '').toLowerCase();
    if (r === servingsRow || r === caloriesRow) return false;
    if (['servings per container', 'serving size', 'hạn sử dụng', 'storage', 'khẩu phần'].some((kw) => nameLower.includes(kw))) {
      return false;
    }
    return Boolean(r.name?.trim() && r.perServing?.trim());
  });

  // Kiểm tra xem có phải dòng Whey / Mass truyền thống (hàm lượng protein >= 10g)
  const proteinRow = nutrientRows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return ['protein', 'đạm', 'whey', 'isolate', 'hydrolyzed'].some((kw) => nameLower.includes(kw));
  });

  const bcaaRow = nutrientRows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return ['bcaa', 'leucine', 'eaa', 'amino'].some((kw) => nameLower.includes(kw));
  });

  const sugarRow = nutrientRows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return ['sugar', 'đường', 'total sugars', 'sugars'].some((kw) => nameLower.includes(kw));
  });

  const isWheyCategory = category === 'whey' || category === 'mass';
  const hasHighProtein = proteinRow && (parseMetricValue(proteinRow.perServing)?.num || 0) >= 10;

  if (isWheyCategory && hasHighProtein) {
    return {
      protein: proteinRow?.perServing || '25g',
      proteinLabel: 'Protein / Lần Dùng',
      bcaa: bcaaRow?.perServing || '5.5g',
      bcaaLabel: 'Hàm Lượng BCAA',
      calories: cleanedCalories || '110',
      caloriesLabel: 'Năng Lượng',
      sugar: sugarRow?.perServing || '0g',
      sugarLabel: 'Hàm Lượng Đường',
      servings: extractedServings || '70',
      servingsLabel: 'Số Lần Dùng',
    };
  }

  // Trường hợp Creatine đặc trưng
  const creatineRow = nutrientRows.find((r) => {
    const nameLower = (r.name || '').toLowerCase();
    return nameLower.includes('creatine');
  });
  if (category === 'strength' || creatineRow) {
    return {
      protein: creatineRow?.perServing || nutrientRows[0]?.perServing || '5g',
      proteinLabel: creatineRow?.name || 'Creatine Monohydrate',
      bcaa: '100% Pure',
      bcaaLabel: 'Độ Tinh Khiết',
      calories: cleanedCalories || '0',
      caloriesLabel: 'Năng Lượng',
      sugar: sugarRow?.perServing || '0%',
      sugarLabel: 'Chất Phụ Gia',
      servings: extractedServings || '60',
      servingsLabel: 'Số Lần Dùng',
    };
  }

  // Trường hợp các dòng Vitamin, Khoáng chất (Kẽm, Magie, Multi...), Pre-workout, Bổ sung đơn chất:
  // Lấy chính xác Tên và Hàm lượng từ các dòng thực tế trong bảng dinh dưỡng
  const item1 = nutrientRows[0];
  const item2 = nutrientRows[1];
  const item3 = nutrientRows[2];
  const item4 = nutrientRows[3];

  return {
    // Chỉ số 1: Tên thành phần 1 + Hàm lượng 1 (vd: Kẽm (Zinc Gluconate): 15 mg)
    protein: item1?.perServing || '15 mg',
    proteinLabel: item1?.name || 'Thành Phần Chính',

    // Chỉ số 2: Tên thành phần 2 + Hàm lượng 2 (vd: Crom (Chromium yeast): 60 mcg)
    bcaa: item2?.perServing || 'Chuẩn Tinh Khiết',
    bcaaLabel: item2?.name || 'Độ Tinh Khiết',

    // Chỉ số 3: Quy cách / Số lần dùng
    servings: extractedServings || (isCapsule ? '90' : '60'),
    servingsLabel,

    // Chỉ số 4: Năng Lượng (nếu bảng có dòng calo, vd: 0.9 kcal) hoặc Thành phần 3
    calories: cleanedCalories || item3?.perServing || '0 Cal',
    caloriesLabel: caloriesRow ? 'Năng Lượng' : (item3?.name || 'Năng Lượng'),

    // Chỉ số 5: Thành phần 3 (nếu chỉ số 4 đã lấy Năng lượng) hoặc Thành phần 4 (vd: Selen 50 mcg)
    sugar: (cleanedCalories && item3) ? item3.perServing : (item4?.perServing || sugarRow?.perServing || '0%'),
    sugarLabel: (cleanedCalories && item3) ? item3.name : (item4?.name || sugarRow?.name || 'Chất Phụ Gia'),
  };
}
