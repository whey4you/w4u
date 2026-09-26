'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase/server';
import { cancelAllinGoOrder } from '@/lib/allingo';
import { fulfillOrderWithAllinGo } from '@/services/allingo-fulfillment.service';
import { Order, OrderStatus } from '@/services/order.service';
import { assertAdminSession } from '@/lib/auth/admin-guard';

export interface AdminOrderItemInput {
  product_id: string;
  product_name: string;
  flavor_name?: string;
  price: number;
  quantity: number;
  image?: string;
  weight_grams?: number;
}

export interface UpdateOrderPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  notes?: string;
  status: OrderStatus;
  codAmount?: number;
  paymentMethod?: string;
  depositAmount?: number;
  codRemaining?: number;
  shippingFee?: number;
  carrierName?: string;
  shippingServiceId?: string;
  items: AdminOrderItemInput[];
}

export interface CreateManualOrderPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  notes?: string;
  codAmount?: number;
  paymentMethod?: string;
  depositAmount?: number;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  shippingFee?: number;
  carrierName?: string;
  shippingServiceId?: string;
  fulfillWithAllinGo?: boolean;
  items: AdminOrderItemInput[];
}

export async function updateAdminOrderAction(payload: UpdateOrderPayload): Promise<{ success: boolean; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  if (!isSupabaseAdminConfigured) {
    return { success: false, error: 'Chưa cấu hình Supabase Admin.' };
  }

  try {
    const subtotal = payload.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const shippingFee = typeof payload.shippingFee === 'number' ? Math.max(0, payload.shippingFee) : 0;
    const totalAmount = subtotal + shippingFee;
    const codAmount = typeof payload.codAmount === 'number'
      ? Math.max(0, payload.codAmount)
      : (typeof payload.codRemaining === 'number' ? payload.codRemaining : 0);
    const isFullPaid = codAmount === 0;
    const paymentMethod = payload.paymentMethod || (isFullPaid ? 'bank_transfer' : 'cod');
    const depositAmount = isFullPaid ? totalAmount : Math.max(0, totalAmount - codAmount);
    const codRemaining = codAmount;

    let updatedNotes = payload.notes?.trim() || null;
    if (payload.shippingServiceId) {
      if (updatedNotes && updatedNotes.includes('[ServiceID:')) {
        updatedNotes = updatedNotes.replace(/\[ServiceID:[^\]]+\]/, `[ServiceID:${payload.shippingServiceId}]`);
      } else {
        updatedNotes = updatedNotes ? `${updatedNotes} | [ServiceID:${payload.shippingServiceId}]` : `[ServiceID:${payload.shippingServiceId}]`;
      }
    }

    const updateFields: Record<string, any> = {
      customer_name: payload.customerName.trim(),
      customer_phone: payload.customerPhone.trim(),
      customer_email: payload.customerEmail !== undefined ? (payload.customerEmail.trim() || null) : undefined,
      customer_address: payload.customerAddress.trim(),
      notes: updatedNotes,
      status: payload.status,
      payment_method: paymentMethod,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      cod_remaining: codRemaining,
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.shippingFee === 'number' && payload.shippingFee > 0) {
      updateFields.shipping_fee = payload.shippingFee;
    }
    if (payload.carrierName) {
      updateFields.carrier_name = payload.carrierName;
    }
    if (payload.provinceCode) {
      updateFields.province_code = payload.provinceCode;
      updateFields.city_id = payload.provinceCode;
    }
    if (payload.districtCode) {
      updateFields.district_code = payload.districtCode;
      updateFields.district_id = payload.districtCode;
    }
    if (payload.wardCode) {
      updateFields.ward_code = payload.wardCode;
      updateFields.ward_id = payload.wardCode;
    }

    const { error: orderErr } = await supabaseAdmin
      .from('orders')
      .update(updateFields)
      .eq('id', payload.orderId);

    if (orderErr) throw orderErr;

    // Cập nhật lại danh sách items trong đơn
    await supabaseAdmin.from('order_items').delete().eq('order_id', payload.orderId);

    if (payload.items.length > 0) {
      const itemsToInsert = payload.items.map((item) => ({
        order_id: payload.orderId,
        product_id: item.product_id,
        product_name: item.product_name,
        flavor_name: item.flavor_name || null,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || null,
        weight_grams: item.weight_grams || 1000,
      }));
      const { error: insertErr } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
      if (insertErr) throw insertErr;
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath('/orders');
    return { success: true };
  } catch (err: any) {
    console.error('[Update Admin Order Error]:', err);
    return { success: false, error: err?.message || 'Không thể cập nhật đơn hàng.' };
  }
}

export async function cancelAllinGoShipmentAction(orderId: string, forceClear: boolean = false): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  if (!isSupabaseAdminConfigured) {
    return { success: false, error: 'Chưa cấu hình Supabase Admin.' };
  }

  try {
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, allingo_order_id, tracking_code, notes')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return { success: false, error: 'Không tìm thấy đơn hàng cần hủy vận đơn.' };
    }

    if (order.allingo_order_id && !forceClear) {
      const result = await cancelAllinGoOrder(order.allingo_order_id, 'buyer_requested', 'Admin hủy vận đơn để cập nhật đơn hàng');
      if (!result.success) {
        const errLower = (result.error || '').toLowerCase();
        const isAlreadyCanceledOrNotFound =
          errLower.includes('canceled') ||
          errLower.includes('cancelled') ||
          errLower.includes('not found') ||
          errLower.includes('không tìm thấy');
        if (!isAlreadyCanceledOrNotFound) {
          return { success: false, error: result.error || 'Bưu tá đã tiếp nhận bưu phẩm, không thể hủy tự động trên AllinGo.' };
        }
      }
    }

    const timestamp = new Date().toLocaleString('vi-VN');
    const logNote = `[Đã hủy vận đơn AllinGo cũ lúc ${timestamp} - Vận đơn: ${order.tracking_code || 'N/A'}]`;
    const updatedNotes = order.notes ? `${order.notes} | ${logNote}` : logNote;

    await supabaseAdmin
      .from('orders')
      .update({
        tracking_code: null,
        allingo_order_id: null,
        allingo_track_id: null,
        tracking_url: null,
        carrier_name: null,
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath('/orders');
    return { success: true, message: 'Đã hủy vận đơn AllinGo thành công. Tiền cước đã hoàn về ví.' };
  } catch (err: any) {
    console.error('[Cancel AllinGo Shipment Error]:', err);
    return { success: false, error: err?.message || 'Lỗi khi hủy vận đơn AllinGo.' };
  }
}

export async function createManualOrderAction(payload: CreateManualOrderPayload): Promise<{ success: boolean; orderId?: string; orderCode?: string; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  if (!isSupabaseAdminConfigured) {
    return { success: false, error: 'Chưa cấu hình Supabase Admin.' };
  }

  try {
    if (!payload.customerName.trim() || !payload.customerPhone.trim()) {
      return { success: false, error: 'Vui lòng nhập tên và số điện thoại khách hàng.' };
    }
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Vui lòng chọn ít nhất 1 sản phẩm.' };
    }

    const subtotal = payload.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const shippingFee = typeof payload.shippingFee === 'number' ? Math.max(0, payload.shippingFee) : 0;
    const totalAmount = subtotal + shippingFee;
    const codAmount = typeof payload.codAmount === 'number'
      ? Math.max(0, payload.codAmount)
      : (typeof payload.depositAmount === 'number' ? Math.max(0, totalAmount - payload.depositAmount) : 0);
    const isFullPaid = codAmount === 0;
    const paymentMethod = payload.paymentMethod || (isFullPaid ? 'bank_transfer' : 'cod');
    const depositAmount = isFullPaid ? totalAmount : Math.max(0, totalAmount - codAmount);
    const codRemaining = codAmount;
    const timePart = Date.now() % 10000000;
    const randPart = Math.floor(10 + Math.random() * 90);
    const prefix = isFullPaid ? 'W4UF' : 'W4UC';
    const orderCode = `${prefix}-${timePart}${randPart}`;

    const status: OrderStatus = 'processing';
    let payNote = isFullPaid
      ? '[Khách chuyển khoản full - Thu COD tiền hàng: 0đ]'
      : (depositAmount > 0
        ? `[Khách đã cọc trước: ${depositAmount}đ | Thu COD tiền hàng: ${codRemaining}đ]`
        : `[Thu COD tiền hàng toàn bộ: ${codRemaining}đ]`);
    const totalWeightGrams = payload.items.reduce((sum, item) => sum + Number(item.weight_grams || 1000) * Number(item.quantity || 1), 0);
    const extraTags = [
      payload.provinceCode ? `[CityID:${payload.provinceCode}]` : '',
      payload.districtCode ? `[DistrictID:${payload.districtCode}]` : '',
      payload.wardCode ? `[WardID:${payload.wardCode}]` : '',
      payload.shippingServiceId ? `[ServiceID:${payload.shippingServiceId}]` : '',
      `[Weight:${Math.max(100, totalWeightGrams)}g]`,
      typeof payload.shippingFee === 'number' ? `[ShippingFee:${payload.shippingFee}đ]` : '',
    ].filter(Boolean).join(' ');

    const fullNotes = [payNote, extraTags, payload.notes?.trim() || ''].filter(Boolean).join(' | ');

    const { data: createdOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_name: payload.customerName.trim(),
        customer_phone: payload.customerPhone.trim(),
        customer_email: payload.customerEmail?.trim() || null,
        customer_address: payload.customerAddress.trim(),
        total_amount: totalAmount,
        shipping_fee: payload.shippingFee || 0,
        carrier_name: payload.carrierName || null,
        payment_method: paymentMethod,
        deposit_amount: depositAmount,
        cod_remaining: codRemaining,
        province_code: payload.provinceCode || null,
        district_code: payload.districtCode || null,
        ward_code: payload.wardCode || null,
        status,
        notes: fullNotes,
      })
      .select('id')
      .single();

    if (orderErr || !createdOrder) throw orderErr;

    const itemsToInsert = payload.items.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.product_id,
      product_name: item.product_name,
      flavor_name: item.flavor_name || null,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image || null,
      weight_grams: item.weight_grams || 1000,
    }));
    await supabaseAdmin.from('order_items').insert(itemsToInsert);

    if (payload.fulfillWithAllinGo) {
      try {
        await fulfillOrderWithAllinGo(createdOrder.id);
      } catch (fErr) {
        console.error('[Manual Order AllinGo Error]:', fErr);
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, orderId: createdOrder.id, orderCode };
  } catch (err: any) {
    console.error('[Create Manual Order Error]:', err);
    return { success: false, error: err?.message || 'Không thể tạo đơn hàng thủ công.' };
  }
}

export async function fulfillManualOrderAction(orderId: string): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  try {
    const res = await fulfillOrderWithAllinGo(orderId);
    revalidatePath('/admin/orders');
    return res;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi lên đơn AllinGo.' };
  }
}

export async function deleteAdminOrderAction(orderId: string): Promise<{ success: boolean; error?: string }> {
  if (!(await assertAdminSession())) {
    return { success: false, error: 'Không có quyền thực hiện: Yêu cầu phiên đăng nhập quản trị.' };
  }
  if (!isSupabaseAdminConfigured) {
    return { success: false, error: 'Chưa cấu hình Supabase Admin.' };
  }

  try {
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, allingo_order_id, tracking_code')
      .eq('id', orderId)
      .single();

    if (fetchErr || !order) {
      return { success: false, error: 'Không tìm thấy đơn hàng cần xóa.' };
    }

    // Nếu đơn hàng có mã AllinGo, tự động hủy trên sàn AllinGo để hoàn tiền cước về ví shop
    if (order.allingo_order_id) {
      try {
        await cancelAllinGoOrder(order.allingo_order_id, 'buyer_requested', 'Admin xóa đơn hàng');
      } catch (cancelErr) {
        console.warn('[Delete Order] Lỗi hủy AllinGo (vẫn tiếp tục xóa đơn):', cancelErr);
      }
    }

    // 1. Xóa các mặt hàng trong order_items
    await supabaseAdmin.from('order_items').delete().eq('order_id', order.id);

    // 2. Xóa đơn hàng trong orders
    const { error: deleteErr } = await supabaseAdmin.from('orders').delete().eq('id', order.id);
    if (deleteErr) throw deleteErr;

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath('/orders');
    return { success: true };
  } catch (err: any) {
    console.error('[Delete Admin Order Error]:', err);
    return { success: false, error: err?.message || 'Không thể xóa đơn hàng.' };
  }
}

export async function getAdminOrdersAction(): Promise<Order[]> {
  if (!(await assertAdminSession())) {
    return [];
  }
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Order[];
}

export async function updateAdminOrderStatusAction(orderId: string, status: OrderStatus): Promise<boolean> {
  if (!(await assertAdminSession())) {
    return false;
  }
  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return true;
  } catch (err) {
    console.error('[Update Order Status Error]:', err);
    return false;
  }
}

export async function getAdminOrderStatsAction() {
  const orders = await getAdminOrdersAction();
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const shippingOrders = orders.filter((o) => o.status === 'shipping').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'completed' || o.status === 'shipping')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return {
    totalOrders,
    pendingOrders,
    shippingOrders,
    completedOrders,
    totalRevenue,
  };
}


