import { supabaseAdmin } from '@/lib/supabase/server';
import { fulfillOrderWithAllinGo } from './allingo-fulfillment.service';
import { incrementCouponUsage } from './coupon.service';
import { sendOrderInvoiceEmail } from './email/resend-email.service';
import { revalidatePath } from 'next/cache';

export interface PendingCheckoutRecord {
  id: string;
  order_code: string;
  numeric_code: number;
  total_amount: number;
  subtotal?: number;
  shipping_fee?: number;
  coupon_code?: string;
  discount_amount?: number;
  carrier_name?: string;
  payment_method: string;
  deposit_amount?: number;
  cod_remaining?: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  city_id?: string;
  district_id?: string;
  ward_id?: string;
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    flavor_name?: string;
    price: number;
    quantity: number;
    image?: string;
    weight_grams?: number;
  }>;
}

/**
 * Cam kết đơn hàng chính thức vào Supabase khi nhận được xác nhận thanh toán VietQR thành công.
 * Cơ chế Idempotent an toàn: Nếu đơn đã được commit trước đó thì trả về ngay.
 */
export async function commitPaidOrder(identifier: number | string): Promise<{ success: boolean; orderId?: string; orderCode?: string; error?: string }> {
  const numericCode = typeof identifier === 'number' ? identifier : Number(String(identifier).replace(/\D/g, ''));
  const orderCode = `W4U-${numericCode}`;

  try {
    // 1. Kiểm tra nếu đơn hàng đã được commit trước đó (tránh duplicate)
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, status')
      .eq('order_code', orderCode)
      .maybeSingle();

    if (existingOrder) {
      return { success: true, orderId: existingOrder.id, orderCode: existingOrder.order_code };
    }

    // 2. Tìm bản ghi draft trong pending_checkouts
    const { data: draft, error: draftErr } = await supabaseAdmin
      .from('pending_checkouts')
      .select('*')
      .eq('numeric_code', numericCode)
      .maybeSingle();

    if (draftErr || !draft) {
      console.warn(`[Checkout Committer] Không tìm thấy pending checkout cho mã: ${numericCode}`);
      return { success: false, error: 'Không tìm thấy thông tin đơn hàng chờ thanh toán.' };
    }

    const typedDraft = draft as PendingCheckoutRecord;
    const isCod = typedDraft.payment_method === 'cod';
    const payLabel = isCod ? 'Đã nhận cọc 100.000đ qua VietQR' : 'Đã thanh toán 100% qua VietQR';
    const noteWithPayment = `${typedDraft.notes || ''} | [PayOS: ${payLabel} lúc ${new Date().toLocaleString('vi-VN')}]`.trim();

    // 3. Ghi vào bảng orders chính thức với trạng thái "processing" (Đã thanh toán)
    const { data: createdOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: typedDraft.order_code,
        customer_name: typedDraft.customer_name,
        customer_phone: typedDraft.customer_phone,
        customer_email: typedDraft.customer_email || null,
        customer_address: typedDraft.customer_address,
        total_amount: typedDraft.total_amount,
        shipping_fee: typedDraft.shipping_fee,
        carrier_name: typedDraft.carrier_name,
        payment_method: typedDraft.payment_method,
        deposit_amount: typedDraft.deposit_amount,
        cod_remaining: typedDraft.cod_remaining,
        city_id: typedDraft.city_id,
        district_id: typedDraft.district_id,
        ward_id: typedDraft.ward_id,
        province_code: typedDraft.province_code,
        district_code: typedDraft.district_code,
        ward_code: typedDraft.ward_code,
        coupon_code: typedDraft.coupon_code || null,
        discount_amount: typedDraft.discount_amount || 0,
        status: 'processing',
        notes: noteWithPayment,
      })
      .select('id')
      .single();

    if (orderErr || !createdOrder) {
      console.error('[Checkout Committer] Lỗi insert orders:', orderErr);
      return { success: false, error: 'Không thể tạo đơn hàng chính thức.' };
    }

    // Tăng số lần sử dụng của coupon nếu có
    if (typedDraft.coupon_code) {
      await incrementCouponUsage(typedDraft.coupon_code);
    }

    // 4. Ghi chi tiết sản phẩm vào order_items
    if (Array.isArray(typedDraft.items) && typedDraft.items.length > 0) {
      const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(
        typedDraft.items.map((item) => ({
          order_id: createdOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          flavor_name: item.flavor_name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          weight_grams: item.weight_grams,
        }))
      );
      if (itemsErr) {
        console.error('[Checkout Committer] Lỗi insert order_items:', itemsErr);
      }
    }

    // 5. Xóa bản ghi draft khỏi pending_checkouts
    await supabaseAdmin.from('pending_checkouts').delete().eq('id', typedDraft.id);

    // 6. Tự động chuyển giao AllinGo tạo vận đơn
    try {
      await fulfillOrderWithAllinGo(createdOrder.id);
    } catch (fulfillErr) {
      console.error('[Checkout Committer] Lỗi AllinGo fulfillment:', fulfillErr);
    }

    // 7. Tự động gửi email hóa đơn điện tử & lời cảm ơn qua Resend API (Async không cản trở)
    if (typedDraft.customer_email) {
      sendOrderInvoiceEmail({
        orderCode: typedDraft.order_code,
        customerName: typedDraft.customer_name,
        customerPhone: typedDraft.customer_phone,
        customerEmail: typedDraft.customer_email,
        customerAddress: typedDraft.customer_address,
        items: Array.isArray(typedDraft.items)
          ? typedDraft.items.map((it) => ({
              product_name: it.product_name,
              flavor_name: it.flavor_name,
              price: it.price,
              quantity: it.quantity,
              image: it.image,
            }))
          : [],
        subtotal: typedDraft.subtotal || typedDraft.total_amount,
        discountAmount: typedDraft.discount_amount || 0,
        couponCode: typedDraft.coupon_code || undefined,
        shippingFee: typedDraft.shipping_fee || 0,
        totalAmount: typedDraft.total_amount,
        depositAmount: typedDraft.deposit_amount || undefined,
        codRemaining: typedDraft.cod_remaining || 0,
        paymentMethod: typedDraft.payment_method,
        carrierName: typedDraft.carrier_name,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }).catch((emailErr) => {
        console.error('[Checkout Committer] Lỗi gửi email hóa đơn:', emailErr);
      });
    }

    // 8. Làm mới trang Admin
    try {
      revalidatePath('/admin/orders');
      revalidatePath('/admin');
    } catch (_) {}

    return { success: true, orderId: createdOrder.id, orderCode: typedDraft.order_code };
  } catch (err: any) {
    console.error('[Checkout Committer Error]:', err);
    return { success: false, error: err?.message || 'Lỗi xử lý lưu đơn hàng' };
  }
}
