import { randomUUID } from 'node:crypto';
import { allingoFetch } from './client';
import { getCentroidByLocation } from './centroids';
import { getBestShippingQuote } from './rates';
import { AllinGoOrderResponse } from './types';
import { getWarehouseConfig } from '@/services/store-settings.service';

export interface CreateAllinGoOrderInput {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerStreet: string;
  provinceCode: string;
  districtCode: string;
  wardCode?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  weightGrams: number;
  codAmount: number;
  declaredAmount: number;
  serviceId?: string;
  notes?: string;
  payee?: 'sender' | 'receiver';
}

export interface CreateAllinGoOrderResult {
  success: boolean;
  orderId?: string;
  trackId?: string;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  fee?: number;
  error?: string;
}

export async function createAllinGoOrder(input: CreateAllinGoOrderInput): Promise<CreateAllinGoOrderResult> {
  try {
    let serviceId = input.serviceId;

    // Nếu chưa có serviceId, tự động truy vấn tìm dịch vụ rẻ nhất
    if (!serviceId) {
      const best = await getBestShippingQuote({
        provinceCode: input.provinceCode,
        districtCode: input.districtCode,
        provinceName: input.provinceName,
        districtName: input.districtName,
        wardName: input.wardName,
        streetAddress: input.customerStreet,
        weightGrams: input.weightGrams,
        amount: input.declaredAmount,
        codAmount: input.codAmount,
      });
      serviceId = best.serviceId;
    }

    const warehouse = await getWarehouseConfig();
    const fromProvince = warehouse.province_code || '79';
    const fromCoords = getCentroidByLocation(fromProvince);
    const toCoords = getCentroidByLocation(input.provinceCode);

    const weightKg = Math.max(0.1, Number((Number(input.weightGrams || 1000) / 1000).toFixed(2)));
    const isCod = input.codAmount > 0;

    const payload = {
      service_id: serviceId,
      pickup: {
        contact_name: warehouse.sender_name,
        contact_phone: warehouse.sender_phone,
        address_line: warehouse.street_address,
        province: warehouse.province_name,
        district: warehouse.district_name,
        ward: warehouse.ward_name,
        location: fromCoords,
      },
      dropoff: {
        contact_name: input.customerName.trim(),
        contact_phone: input.customerPhone.trim(),
        address_line: input.customerStreet.trim(),
        province: input.provinceName,
        district: input.districtName,
        ward: input.wardName,
        location: toCoords,
        note: input.notes,
      },
      package: {
        weight: weightKg,
        length: 20,
        width: 15,
        height: 15,
        declared_value: input.declaredAmount || 500000,
      },
      cod_amount: input.codAmount,
      delivery_payment_method: 'credit',
      deliverable_payment_method: isCod ? 'cod' : 'prepaid',
      payee: input.payee || 'receiver',
      external_reference: input.orderCode,
    };

    const idempotencyKey = `w4u-order-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const res = await allingoFetch<AllinGoOrderResponse>('/orders', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (res?.id) {
      const trackingNumber = res.delivery?.partner_track_id || res.track_id;
      const trackingUrl = res.delivery?.track_link || res.delivery?.partner_track_link || (res.track_id ? `https://business.allingo.vn/track/${res.track_id}#/track/${res.track_id}` : undefined);

      return {
        success: true,
        orderId: res.id,
        trackId: res.track_id,
        carrierName: res.delivery?.partner?.name || 'Đơn vị vận chuyển',
        trackingNumber,
        trackingUrl,
        fee: res.fee?.total,
      };
    }

    return {
      success: false,
      error: 'Không thể tạo vận đơn AllinGo.',
    };
  } catch (err: any) {
    console.error('[AllinGo Order Error]:', err);
    return {
      success: false,
      error: err?.message || 'Đã xảy ra lỗi khi tạo vận đơn AllinGo.',
    };
  }
}

export interface CancelAllinGoOrderResult {
  success: boolean;
  refundedAmount?: number;
  error?: string;
}

export async function cancelAllinGoOrder(
  allingoOrderId: string,
  reason: string = 'buyer_requested',
  note: string = 'Khách yêu cầu điều chỉnh đơn hàng'
): Promise<CancelAllinGoOrderResult> {
  try {
    const cleanId = allingoOrderId.trim();
    if (!cleanId) {
      return { success: false, error: 'Thiếu mã đơn AllinGo cần hủy.' };
    }

    const idempotencyKey = `cancel-${cleanId}-${Date.now()}`;
    const res = await allingoFetch<{
      id: string;
      status: string;
      refunded_amount?: number;
    }>(`/orders/${encodeURIComponent(cleanId)}/cancel`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ reason, note }),
    });

    if (res?.status === 'canceled') {
      return {
        success: true,
        refundedAmount: res.refunded_amount,
      };
    }

    return {
      success: false,
      error: 'Không thể hủy đơn hàng AllinGo.',
    };
  } catch (err: any) {
    console.error('[AllinGo Cancel Error]:', err);
    return {
      success: false,
      error: err?.message || 'Lỗi khi hủy đơn hàng AllinGo.',
    };
  }
}
