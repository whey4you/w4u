import { supabaseAdmin } from '@/lib/supabase/server';
import { createAllinGoOrder } from '@/lib/allingo';

interface OrderFulfillmentData {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method?: string;
  status: string;
  notes?: string;
  city_id?: string;
  district_id?: string;
  ward_id?: string;
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  total_weight_grams?: number;
  deposit_amount?: number;
  cod_remaining?: number;
  tracking_code?: string;
  allingo_order_id?: string;
  allingo_track_id?: string;
  tracking_url?: string;
  carrier_name?: string;
}

function parseAddressFromNotes(notes: string = ''): { provinceCode?: string; districtCode?: string; wardCode?: string; weightGrams?: number; serviceId?: string } {
  const cityMatch = notes.match(/\[CityID:(\w+)\]/);
  const districtMatch = notes.match(/\[DistrictID:(\w+)\]/);
  const wardMatch = notes.match(/\[WardID:(\w+)\]/);
  const weightMatch = notes.match(/\[Weight:(\d+)g\]/);
  const serviceMatch = notes.match(/\[ServiceID:([^\]]+)\]/);

  return {
    provinceCode: cityMatch ? cityMatch[1] : undefined,
    districtCode: districtMatch ? districtMatch[1] : undefined,
    wardCode: wardMatch ? wardMatch[1] : undefined,
    weightGrams: weightMatch ? Number(weightMatch[1]) : undefined,
    serviceId: serviceMatch ? serviceMatch[1] : undefined,
  };
}

export interface FulfillOrderResult {
  success: boolean;
  trackingNumber?: string;
  allingoOrderId?: string;
  allingoTrackId?: string;
  trackingUrl?: string;
  carrierName?: string;
  error?: string;
}

export async function fulfillOrderWithAllinGo(orderId: string): Promise<FulfillOrderResult> {
  try {
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return { success: false, error: 'Không tìm thấy đơn hàng để lên vận đơn.' };
    }

    const ord = order as OrderFulfillmentData;

    // Idempotency: Kiểm tra nếu đã có mã vận đơn thì không tạo lại
    if (ord.tracking_code || ord.allingo_order_id) {
      console.log(`[AllinGo Fulfillment] Đơn ${ord.order_code} đã có vận đơn (${ord.tracking_code}), bỏ qua.`);
      return {
        success: true,
        trackingNumber: ord.tracking_code,
        allingoOrderId: ord.allingo_order_id,
        trackingUrl: ord.allingo_track_id ? `https://business.allingo.vn/track/${ord.allingo_track_id}#/track/${ord.allingo_track_id}` : undefined,
      };
    }

    const parsedNotes = parseAddressFromNotes(ord.notes || '');
    const provinceCode = ord.province_code || ord.city_id || parsedNotes.provinceCode || '79';
    const districtCode = ord.district_code || ord.district_id || parsedNotes.districtCode || '760';
    const wardCode = ord.ward_code || ord.ward_id || parsedNotes.wardCode;
    const weightGrams = Number(ord.total_weight_grams) || Number(parsedNotes.weightGrams) || 1000;

    // Tính tiền COD: Nếu có cod_remaining (Admin đặt hoặc từ đơn) thì dùng trực tiếp
    // Nếu codAmount = 0 -> khách đã thanh toán full 100% (cả hàng & ship), shipper không thu tiền
    const codAmount = typeof ord.cod_remaining === 'number'
      ? Math.max(0, Number(ord.cod_remaining))
      : (ord.payment_method === 'cod' ? Math.max(0, Number(ord.total_amount) - Number(ord.deposit_amount || 100000)) : 0);

    console.log(`[AllinGo Fulfillment] Đang tạo vận đơn cho ${ord.order_code} (${weightGrams}g, COD: ${codAmount}đ, AllinGo COD offset)...`);

    const result = await createAllinGoOrder({
      orderCode: ord.order_code,
      customerName: ord.customer_name,
      customerPhone: ord.customer_phone,
      customerStreet: ord.customer_address,
      provinceCode,
      districtCode,
      wardCode,
      codAmount,
      declaredAmount: Number(ord.total_amount) || 500000,
      weightGrams,
      serviceId: parsedNotes.serviceId,
      payee: 'sender',
      notes: codAmount > 0
        ? `Thu COD: ${codAmount.toLocaleString('vi-VN')}đ (Đã gồm tiền hàng & cước ship - Khách không trả thêm tiền ship)`
        : 'Đơn đã thanh toán 100% (cả tiền hàng & cước ship) - Không thu tiền',
    });

    const timestamp = new Date().toLocaleString('vi-VN');

    if (result.success && result.trackingNumber) {
      const trackingUrl = result.trackingUrl || (result.trackId ? `https://business.allingo.vn/track/${result.trackId}#/track/${result.trackId}` : undefined);
      const logNote = `[Vận chuyển: Đã lên đơn thành công lúc ${timestamp} - Mã vận đơn: ${result.trackingNumber}]`;
      const updatedNotes = ord.notes ? `${ord.notes} | ${logNote}` : logNote;

      const updateData: Record<string, any> = {
        carrier_name: result.carrierName || 'Đơn vị vận chuyển',
        tracking_code: result.trackingNumber,
        allingo_order_id: result.orderId || null,
        allingo_track_id: result.trackId || null,
        tracking_url: trackingUrl,
        shipping_fee: result.fee || 0,
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      };

      const { error: updateErr } = await supabaseAdmin.from('orders').update(updateData).eq('id', ord.id);

      if (updateErr) {
        // Fallback: nếu các cột allingo_* chưa có trong schema, lưu vào notes
        await supabaseAdmin.from('orders').update({
          notes: `${updatedNotes} | [Link tra cứu: ${trackingUrl}]`,
          updated_at: new Date().toISOString(),
        }).eq('id', ord.id);
      }

      console.log(`[AllinGo Fulfillment] Thành công: ${result.trackingNumber} cho đơn ${ord.order_code}`);
      return {
        success: true,
        trackingNumber: result.trackingNumber,
        allingoOrderId: result.orderId,
        allingoTrackId: result.trackId,
        trackingUrl,
        carrierName: result.carrierName || 'Đơn vị vận chuyển',
      };
    } else {
      const errNote = `[AllinGo Lỗi lúc ${timestamp}: ${result.error || 'Tạo vận đơn thất bại'}]`;
      await supabaseAdmin.from('orders').update({
        notes: ord.notes ? `${ord.notes} | ${errNote}` : errNote,
        updated_at: new Date().toISOString(),
      }).eq('id', ord.id);

      console.error(`[AllinGo Fulfillment] Thất bại cho đơn ${ord.order_code}:`, result.error);
      return { success: false, error: result.error };
    }
  } catch (err: any) {
    console.error('[AllinGo Fulfillment Exception]:', err);
    return { success: false, error: err?.message || 'Lỗi không xác định khi lên đơn AllinGo.' };
  }
}
