import { supabaseAdmin } from '@/lib/supabase/server';
import { Coupon, CreateCouponInput, CouponValidationResult } from '@/types/coupon';
import { evaluateCoupon } from '@/lib/coupon-calculator';

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle();

  if (error || !data) return null;
  return data as Coupon;
}

export async function validateAndCalculateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await getCouponByCode(code);
  if (!coupon) {
    return { valid: false, error: 'Mã giảm giá không tồn tại hoặc đã bị xóa.' };
  }

  return evaluateCoupon(coupon, subtotal);
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return;

  try {
    const coupon = await getCouponByCode(cleanCode);
    if (!coupon) return;

    await supabaseAdmin
      .from('coupons')
      .update({
        used_count: (coupon.used_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', coupon.id);
  } catch (err) {
    console.error(`[CouponService] Lỗi khi cập nhật used_count cho mã ${cleanCode}:`, err);
  }
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Coupon[];
  } catch (err) {
    console.error('[CouponService] Lỗi khi lấy danh sách coupons:', err);
    return [];
  }
}

export async function createCoupon(
  input: CreateCouponInput
): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
  try {
    const code = input.code.trim().toUpperCase();
    if (!code || code.length < 2) {
      return { success: false, error: 'Mã giảm giá phải có ít nhất 2 ký tự.' };
    }

    const payload = {
      code,
      description: input.description?.trim() || null,
      discount_type: input.discount_type,
      discount_value: Number(input.discount_value),
      min_order_value: Number(input.min_order_value || 0),
      max_discount_amount: input.max_discount_amount ? Number(input.max_discount_amount) : null,
      usage_limit: input.usage_limit ? Number(input.usage_limit) : null,
      is_active: input.is_active ?? true,
      expires_at: input.expires_at || null,
    };

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Mã giảm giá "${code}" đã tồn tại.` };
      }
      return { success: false, error: error.message };
    }

    return { success: true, coupon: data as Coupon };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống khi tạo mã giảm giá.' };
  }
}

export async function toggleCouponActive(id: string, isActive: boolean): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('coupons')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

export async function updateCoupon(
  id: string,
  input: Partial<CreateCouponInput>
): Promise<{ success: boolean; coupon?: Coupon; error?: string }> {
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.code !== undefined) {
      const cleanCode = input.code.trim().toUpperCase();
      if (!cleanCode || cleanCode.length < 2) {
        return { success: false, error: 'Mã giảm giá phải có ít nhất 2 ký tự.' };
      }
      payload.code = cleanCode;
    }
    if (input.description !== undefined) payload.description = input.description?.trim() || null;
    if (input.discount_type !== undefined) payload.discount_type = input.discount_type;
    if (input.discount_value !== undefined) payload.discount_value = Number(input.discount_value);
    if (input.min_order_value !== undefined) payload.min_order_value = Number(input.min_order_value);
    if (input.max_discount_amount !== undefined) {
      payload.max_discount_amount = input.max_discount_amount !== null && input.max_discount_amount !== undefined
        ? Number(input.max_discount_amount)
        : null;
    }
    if (input.usage_limit !== undefined) {
      payload.usage_limit = input.usage_limit !== null && input.usage_limit !== undefined
        ? Number(input.usage_limit)
        : null;
    }
    if (input.is_active !== undefined) payload.is_active = input.is_active;
    if (input.expires_at !== undefined) payload.expires_at = input.expires_at || null;

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `Mã giảm giá "${payload.code}" đã trùng với một mã khác.` };
      }
      return { success: false, error: error.message };
    }

    return { success: true, coupon: data as Coupon };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống khi cập nhật mã giảm giá.' };
  }
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);
  return !error;
}
