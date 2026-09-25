import { NextRequest, NextResponse } from 'next/server';
import { SPXTrackingResult, SPXStatusCategory, SPXTrackingRecord } from '@/types/spx';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';

interface CacheEntry {
  data: SPXTrackingResult;
  expiresAt: number;
}
const spxCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

function resolveStatus(
  milestoneCode: number,
  trackingCode: string
): { category: SPXStatusCategory; label: string } {
  if (milestoneCode === 8 || trackingCode === 'F980') {
    return { category: 'delivered', label: 'Giao hàng thành công' };
  }
  if (milestoneCode === 10 || trackingCode === 'F999') {
    return { category: 'returned', label: 'Đơn hàng hoàn trả' };
  }
  if (milestoneCode === 1 || trackingCode === 'F000') {
    return { category: 'preparing', label: 'Người bán đang chuẩn bị hàng' };
  }
  return { category: 'in_transit', label: 'Đang vận chuyển' };
}

export async function GET(request: NextRequest) {
  // Giới hạn 12 lượt tra cứu / phút trên mỗi IP để bảo vệ IP máy chủ khỏi bị SPX chặn
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`spx_lookup:${clientIp}`, 12, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json<SPXTrackingResult>(
      {
        success: false,
        tracking_number: '',
        status_category: 'unknown',
        status_label: 'Vượt quá tần suất',
        records: [],
        error_message: 'Bạn đang tra cứu quá nhanh. Vui lòng thử lại sau 1 phút.',
      },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawTn = searchParams.get('spx_tn') || '';
  const cleanTn = rawTn.trim().toUpperCase();

  if (!cleanTn) {
    return NextResponse.json<SPXTrackingResult>(
      {
        success: false,
        tracking_number: '',
        status_category: 'unknown',
        status_label: 'Thiếu mã vận đơn',
        records: [],
        error_message: 'Vui lòng nhập mã vận đơn SPX hợp lệ.',
      },
      { status: 400 }
    );
  }

  // Kiểm tra bộ đệm cache
  const cached = spxCache.get(cleanTn);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json<SPXTrackingResult>(cached.data);
  }

  try {
    const spxUrl = `https://spx.vn/shipment/order/open/order/get_order_info?spx_tn=${encodeURIComponent(cleanTn)}&language_code=vi`;
    const response = await fetch(spxUrl, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
        accept: 'application/json, text/plain, */*',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`SPX phản hồi mã lỗi HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.retcode !== 0 || !data.data) {
      return NextResponse.json<SPXTrackingResult>({
        success: false,
        tracking_number: cleanTn,
        status_category: 'unknown',
        status_label: 'Không tìm thấy',
        records: [],
        error_message:
          'Mã vận đơn không tồn tại hoặc chưa được cập nhật trên hệ thống SPX Express.',
      });
    }

    const records: SPXTrackingRecord[] = data.data.sls_tracking_info?.records || [];
    const latestRecord = records[0];
    const milestoneCode = latestRecord?.milestone_code ?? 0;
    const trackingCode = latestRecord?.tracking_code ?? '';
    const { category, label } = resolveStatus(milestoneCode, trackingCode);

    const result: SPXTrackingResult = {
      success: true,
      tracking_number: cleanTn,
      sls_tn: data.data.order_info?.sls_tn || data.data.parcel_info?.customer_tracking_no,
      status_category: category,
      status_label: label,
      latest_record: latestRecord,
      edd_info: data.data.edd_info,
      records,
    };

    spxCache.set(cleanTn, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json<SPXTrackingResult>(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi kết nối máy chủ';
    return NextResponse.json<SPXTrackingResult>(
      {
        success: false,
        tracking_number: cleanTn,
        status_category: 'unknown',
        status_label: 'Lỗi tra cứu',
        records: [],
        error_message: message,
      },
      { status: 500 }
    );
  }
}
