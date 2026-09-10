import { SPXTrackingResult } from '@/types/spx';

export async function trackSPXOrder(trackingNumber: string): Promise<SPXTrackingResult> {
  const clean = trackingNumber.trim().toUpperCase();
  if (!clean) {
    return {
      success: false,
      tracking_number: '',
      status_category: 'unknown',
      status_label: 'Thiếu mã',
      records: [],
      error_message: 'Vui lòng nhập mã vận đơn.',
    };
  }

  try {
    const res = await fetch(`/api/tracking/spx?spx_tn=${encodeURIComponent(clean)}`);
    const data: SPXTrackingResult = await res.json();
    return data;
  } catch (err: unknown) {
    return {
      success: false,
      tracking_number: clean,
      status_category: 'unknown',
      status_label: 'Lỗi mạng',
      records: [],
      error_message: err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ tra cứu.',
    };
  }
}
