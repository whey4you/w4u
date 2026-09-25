import { allingoFetch } from './client';
import { getCentroidByLocation } from './centroids';
import { AllinGoInquiriesResponse, AllinGoQuote } from './types';

export interface RateInquiryParams {
  provinceCode: string;
  districtCode: string;
  wardCode?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  streetAddress?: string;
  weightGrams?: number;
  amount?: number;
  codAmount?: number;
  payee?: 'sender' | 'receiver';
}

export interface BestRateResult {
  serviceId: string;
  carrierName: string;
  carrierId: string;
  serviceName: string;
  totalFee: number;
  expected: string;
  isFallback?: boolean;
}

export async function getAllinGoQuotes(params: RateInquiryParams): Promise<AllinGoQuote[]> {
  const fromProvince = process.env.ALLINGO_FROM_PROVINCE || '79'; // TP.HCM
  const fromDistrict = process.env.ALLINGO_FROM_DISTRICT || '760'; // Quận 1
  const fromCoords = getCentroidByLocation(fromProvince);
  const toCoords = getCentroidByLocation(params.provinceCode);

  const weightKg = Math.max(0.1, Number((Number(params.weightGrams || 1000) / 1000).toFixed(2)));

  const payload = {
    pickup: {
      contact_name: process.env.ALLINGO_FROM_NAME || 'Whey4You Warehouse',
      contact_phone: process.env.ALLINGO_FROM_PHONE || '0987654321',
      address_line: process.env.ALLINGO_FROM_STREET || '123 Nguyễn Thị Minh Khai',
      province: 'Thành phố Hồ Chí Minh',
      district: 'Quận 1',
      location: fromCoords,
    },
    dropoff: {
      contact_name: 'Khách hàng',
      contact_phone: '0901234567',
      address_line: params.streetAddress || 'Địa chỉ giao hàng',
      province: params.provinceName,
      district: params.districtName,
      ward: params.wardName,
      location: toCoords,
    },
    package: {
      weight: weightKg,
      length: 20,
      width: 15,
      height: 15,
      declared_value: params.amount ?? 500000,
    },
    cod_amount: params.codAmount ?? 0,
    delivery_payment_method: 'credit',
    payee: params.payee || 'receiver',
  };

  try {
    const res = await allingoFetch<AllinGoInquiriesResponse>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (Array.isArray(res?.quotes)) {
      return res.quotes.filter((q) => q.available);
    }
    return [];
  } catch (err) {
    console.error('[AllinGo Rates] Lỗi tra cước inquiries:', err);
    return [];
  }
}

export type ShippingCategory = 'instant' | 'standard';

export interface FormattedShippingRate {
  id: string;
  carrierName: string;
  carrierId: string;
  serviceName: string;
  totalFee: number;
  expected: string;
  logo?: string;
  tag?: 'cheapest' | 'fastest';
  category?: ShippingCategory;
  isFallback?: boolean;
}

/**
 * Bản đồ logo chính hãng của các đơn vị giao hàng
 */
export function getCarrierLogo(partnerId: string = '', partnerName: string = ''): string | undefined {
  const id = partnerId.toLowerCase();
  const name = partnerName.toLowerCase();

  if (id.includes('viettel') || name.includes('viettel')) return '/carriers/viettelpost.svg';
  if (id.includes('ghn') || name.includes('ghn') || name.includes('giao hàng nhanh')) return '/carriers/ghn.png';
  if (id.includes('spx') || id.includes('shopee') || name.includes('spx') || name.includes('shopee')) return '/carriers/spx.svg';
  if (id.includes('jt') || name.includes('j&t') || name.includes('jt')) return '/carriers/jtexpress.png';
  if (id.includes('grab') || name.includes('grab')) return 'https://allingo.s3.amazonaws.com/images/ccb6b63bdab89ab052b0717406cd09b9_1778331032369.jpg';
  if (id.includes('lalamove') || name.includes('lalamove')) return 'https://allingo.s3.amazonaws.com/images/f314748325a2dca9612e8b0d2dfb9f78_Lalamove.png';
  if (id.includes('gsm') || id.includes('xanh') || name.includes('xanh sm') || name.includes('gsm')) return 'https://allingo.s3.amazonaws.com/images/a662be1ca0d20df754a49d203b4a17e1_gsm.jpg';
  return undefined;
}

/**
 * Lấy danh sách toàn bộ các hãng vận chuyển khả dụng đã được format sạch đẹp
 */
export async function getAllShippingQuotesFormatted(params: RateInquiryParams): Promise<FormattedShippingRate[]> {
  const quotes = await getAllinGoQuotes(params);
  const weightGrams = Math.max(100, Number(params.weightGrams) || 1000);

  // Lọc chỉ lấy các gói khả dụng, giá hợp lệ
  let validQuotes = quotes.filter((q) => q.available && q.price > 0);

  // Loại trừ các đơn vị theo yêu cầu: VNPost (5), Best Express (6), Nhất Tín Logistics (7) và simulator
  const EXCLUDED_PARTNERS = ['vnpost', 'best', 'ntl', 'simulator'];
  validQuotes = validQuotes.filter((q) => {
    const pId = (q.partner?.id || '').toLowerCase();
    const pName = (q.partner?.name || '').toLowerCase();
    return !EXCLUDED_PARTNERS.some((ex) => pId.includes(ex) || pName.includes(ex));
  });

  if (validQuotes.length > 0) {
    const formattedList: FormattedShippingRate[] = validQuotes.map((q) => {
      const pId = (q.partner?.id || 'standard').toLowerCase();
      const pName = q.partner?.name || 'Vận chuyển tiêu chuẩn';
      const sName = q.service_name || 'Tiêu chuẩn';
      const sNameLower = sName.toLowerCase();

      // Nhận diện dịch vụ hỏa tốc nội thành (Grab, XanhSM, SPX Instant, Viettel Hỏa tốc, Lalamove)
      const isInstant =
        pId.includes('grab') ||
        pId.includes('gsm') ||
        pId.includes('lalamove') ||
        sNameLower.includes('instant') ||
        sNameLower.includes('hỏa tốc') ||
        sNameLower.includes('1h') ||
        sNameLower.includes('2h');

      const category: ShippingCategory = isInstant ? 'instant' : 'standard';

      let expected = 'Dự kiến 1-3 ngày';
      if (isInstant) {
        if (sNameLower.includes('1h')) expected = 'Giao trong 1 giờ';
        else if (sNameLower.includes('2h')) expected = 'Giao trong 2 giờ';
        else expected = 'Giao hỏa tốc trong ngày';
      } else if (q.estimated_delivery_range) {
        expected = q.estimated_delivery_range.replace('days', 'ngày').replace('day', 'ngày');
      }

      return {
        id: q.service_id,
        carrierName: pName,
        carrierId: pId,
        serviceName: sName,
        totalFee: q.price,
        expected,
        logo: getCarrierLogo(pId, pName),
        category,
        isFallback: false,
      };
    });

    // Tách thành 2 nhóm và sắp xếp giá tăng dần trong từng nhóm
    const instantList = formattedList
      .filter((r) => r.category === 'instant')
      .sort((a, b) => a.totalFee - b.totalFee);
    const standardList = formattedList
      .filter((r) => r.category === 'standard')
      .sort((a, b) => a.totalFee - b.totalFee);

    // Gắn tag tiết kiệm nhất cho gói rẻ nhất của từng nhóm (không dùng nhãn khuyên dùng)
    if (instantList.length > 0) {
      instantList[0].tag = 'cheapest';
    }
    if (standardList.length > 0) {
      standardList[0].tag = 'cheapest';
    }

    // Ưu tiên nhóm hỏa tốc nội thành lên đầu tiên
    return [...instantList, ...standardList];
  }

  // Fallback an toàn nếu chưa có báo giá từ API (chỉ dùng SPX Express)
  const baseFee = 18000;
  const extraWeightFee = Math.max(0, Math.ceil((weightGrams - 1000) / 1000)) * 5000;

  return [
    {
      id: 'fallback_spx',
      carrierName: 'SPX Express',
      carrierId: 'spx',
      serviceName: 'Tiêu chuẩn',
      totalFee: baseFee + extraWeightFee,
      expected: 'Dự kiến 1-3 ngày',
      logo: '/carriers/spx.svg',
      category: 'standard',
      isFallback: true,
    },
  ];
}

/**
 * Tự động chọn báo giá cước rẻ nhất và tối ưu nhất trong các hãng khả dụng
 */
export async function getBestShippingQuote(params: RateInquiryParams): Promise<BestRateResult> {
  const rates = await getAllShippingQuotesFormatted(params);
  const best = rates.find((r) => r.tag === 'cheapest') || [...rates].sort((a, b) => a.totalFee - b.totalFee)[0] || rates[0];

  return {
    serviceId: best.id,
    carrierName: best.carrierName,
    carrierId: best.carrierId,
    serviceName: best.serviceName,
    totalFee: best.totalFee,
    expected: best.expected,
    isFallback: best.isFallback,
  };
}
