'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/server';
import { CheckoutInput, CheckoutItemInput, CheckoutResult, PaymentMethod } from '@/types/checkout';
import { getPayOS, isPayOSConfigured } from '@/lib/payos';
import { getBestShippingQuote, isInstantDeliveryTimeActive } from '@/lib/allingo';
import { validateAndCalculateCoupon } from '@/services/coupon.service';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { headers } from 'next/headers';

async function getActionIp(): Promise<string> {
  try {
    const h = await headers();
    const f = h.get('x-forwarded-for');
    if (f) return f.split(',')[0].trim();
    const r = h.get('x-real-ip');
    if (r) return r.trim();
    return '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}

interface ProductRow {
  id: string;
  name: string;
  price: number;
  weight_kg?: number;
  default_image: string;
  in_stock: boolean;
  product_flavors: { id: string; name: string; image?: string }[];
  product_sizes: {
    id: string;
    price: number;
    weight_kg?: number;
    in_stock: boolean;
    flavor_prices?: Record<string, { price: number; originalPrice?: number }>;
  }[];
}

interface ValidatedOrderItem {
  product_id: string;
  product_name: string;
  flavor_name: string;
  price: number;
  quantity: number;
  image: string;
  weight_grams: number;
}

function validateCustomer(input: CheckoutInput): string | null {
  const phone = input.customerPhone.replace(/[\s.-]/g, '');
  if (input.customerName.trim().length < 2) return 'Vui lòng nhập họ tên hợp lệ.';
  if (!/^(?:\+84|0)\d{9}$/.test(phone)) return 'Số điện thoại chưa đúng định dạng Việt Nam.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.customerEmail || !emailRegex.test(input.customerEmail.trim())) {
    return 'Vui lòng nhập địa chỉ email hợp lệ để nhận hóa đơn điện tử.';
  }
  if (input.customerAddress.trim().length < 10) return 'Vui lòng nhập địa chỉ giao hàng đầy đủ.';
  if (input.items.length === 0 || input.items.length > 20) return 'Giỏ hàng không hợp lệ.';
  return null;
}

function findVariant(item: CheckoutItemInput, products: ProductRow[]): ValidatedOrderItem | null {
  const product = products.find(({ id }) => id === item.productId);
  if (!product?.in_stock || item.quantity < 1 || item.quantity > 20) return null;
  const flavor = product.product_flavors.find(({ id }) => id === item.flavorId);
  const size = item.sizeId
    ? product.product_sizes.find(({ id }) => id === item.sizeId)
    : undefined;
  if (!flavor || (item.sizeId && (!size || !size.in_stock))) return null;

  let unitPrice = Number(size?.price ?? product.price);
  if (size?.flavor_prices && size.flavor_prices[flavor.id]) {
    const customFp = size.flavor_prices[flavor.id];
    if (typeof customFp.price === 'number' && customFp.price > 0) {
      unitPrice = customFp.price;
    }
  }

  const effectiveWeightKg = size?.weight_kg ?? product.weight_kg ?? 1.0;
  const weightGrams = Math.round(Number(effectiveWeightKg) * 1000);

  return {
    product_id: product.id,
    product_name: product.name,
    flavor_name: flavor.name,
    price: unitPrice,
    quantity: item.quantity,
    image: flavor.image || product.default_image,
    weight_grams: weightGrams,
  };
}

async function loadProducts(items: CheckoutItemInput[]) {
  const ids = Array.from(new Set(items.map(({ productId }) => productId)));
  return supabaseAdmin
    .from('products')
    .select('id,name,price,weight_kg,default_image,in_stock,product_flavors(id,name,image),product_sizes(id,price,weight_kg,in_stock,flavor_prices)')
    .in('id', ids);
}

function generateOrderCode(isDeposit = false): { orderCode: string; numericCode: number } {
  const timePart = Date.now() % 10000000;
  const randPart = Math.floor(10 + Math.random() * 90);
  const numericCode = Number(`${timePart}${randPart}`);
  const prefix = isDeposit ? 'W4UC' : 'W4UF';
  return { orderCode: `${prefix}-${numericCode}`, numericCode };
}

async function createPayOSLink(
  numericCode: number,
  payAmount: number,
  validItems: ValidatedOrderItem[],
  shippingFee: number,
  input: CheckoutInput,
  isDeposit = false,
  carrierName = 'Vận chuyển tiêu chuẩn',
  discountAmount = 0
) {
  const payos = getPayOS();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const desc = (isDeposit ? `W4UC ${numericCode}` : `W4UF ${numericCode}`).slice(0, 25);
  const prefix = isDeposit ? 'W4UC' : 'W4UF';
  const items = isDeposit
    ? [{ name: `Đặt cọc đơn hàng ${prefix}-${numericCode}`, quantity: 1, price: payAmount }]
    : (discountAmount > 0
        ? [{ name: `Đơn hàng ${prefix}-${numericCode}`, quantity: 1, price: payAmount }]
        : [
            ...validItems.map((item) => ({
              name: item.product_name.slice(0, 50),
              quantity: item.quantity,
              price: item.price,
            })),
            ...(shippingFee > 0
              ? [{ name: `Cước VC (${carrierName})`.slice(0, 50), quantity: 1, price: shippingFee }]
              : []),
          ]);

  return payos.paymentRequests.create({
    orderCode: numericCode,
    amount: payAmount,
    description: desc,
    cancelUrl: `${appUrl}/orders`,
    returnUrl: `${appUrl}/orders`,
    items,
    buyerName: input.customerName.trim(),
    buyerPhone: input.customerPhone.trim(),
    buyerAddress: input.customerAddress.trim(),
  });
}

export async function createOrderAction(input: CheckoutInput): Promise<CheckoutResult> {
  // 1. Kiểm tra Honeypot Trap (nếu bot tự động điền trường ẩn)
  if ((input as any).website_hp) {
    return { success: false, error: 'Yêu cầu không hợp lệ.' };
  }

  // 2. Chống spam tạo đơn: Giới hạn tối đa 5 lần khởi tạo / 15 phút trên mỗi IP
  const ip = await getActionIp();
  const rateCheck = checkRateLimit(`checkout_create:${ip}`, 5, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: 'Bạn đã khởi tạo đơn hàng quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau 15 phút hoặc liên hệ hotline để được hỗ trợ.',
    };
  }

  if (!isSupabaseAdminConfigured) {
    return { success: false, error: 'Hệ thống đặt hàng chưa được cấu hình.' };
  }
  const validationError = validateCustomer(input);
  if (validationError) return { success: false, error: validationError };

  const { data, error } = await loadProducts(input.items);
  if (error || !data) return { success: false, error: 'Không thể kiểm tra sản phẩm lúc này.' };

  const orderItems = input.items.map((item) => findVariant(item, data as ProductRow[]));
  if (orderItems.some((item) => !item)) {
    return { success: false, error: 'Một lựa chọn đã hết hàng hoặc không còn tồn tại.' };
  }

  const validItems = orderItems as ValidatedOrderItem[];
  const subtotal = validItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalWeightGrams = validItems.reduce((total, item) => total + (item.weight_grams || 1000) * item.quantity, 0);

  // Sử dụng đơn vị vận chuyển do khách hàng chọn (hoặc tự động tra cước tối ưu nếu chưa có)
  let shippingFee = typeof input.shippingFee === 'number' && input.shippingFee > 0 ? input.shippingFee : 30000;
  let carrierName = input.carrierName?.trim() || 'Vận chuyển tiêu chuẩn';
  let shippingServiceId = input.shippingServiceId?.trim();

  // Chặn nhận đơn hỏa tốc (Grab, Xanh SM) nếu khách đặt ngoài khung giờ 8:00 - 22:00 giờ Việt Nam
  if (carrierName && !isInstantDeliveryTimeActive()) {
    const cLower = carrierName.toLowerCase();
    const isInstantSelected =
      cLower.includes('grab') ||
      cLower.includes('xanh') ||
      cLower.includes('gsm') ||
      cLower.includes('hỏa tốc') ||
      cLower.includes('instant');

    if (isInstantSelected) {
      return {
        success: false,
        error: 'Dịch vụ giao hỏa tốc (Grab, Xanh SM) chỉ nhận đơn trong khung giờ 8:00 - 22:00. Vui lòng chọn hình thức giao tiêu chuẩn hoặc quay lại trong khung giờ phục vụ.',
      };
    }
  }

  if (!shippingServiceId && input.cityId && input.districtId) {
    try {
      const bestQuote = await getBestShippingQuote({
        provinceCode: String(input.cityId),
        districtCode: String(input.districtId),
        wardCode: input.wardId ? String(input.wardId) : undefined,
        weightGrams: totalWeightGrams,
        amount: subtotal,
      });
      shippingFee = bestQuote.totalFee;
      carrierName = bestQuote.carrierName;
      shippingServiceId = bestQuote.serviceId;
    } catch (err) {
      console.error('[AllinGo Rate Error]:', err);
    }
  }

  // Kiểm tra & áp dụng mã giảm giá (Coupon) từ server
  let discountAmount = 0;
  let verifiedCouponCode: string | undefined = undefined;

  if (input.couponCode && input.couponCode.trim()) {
    const couponEval = await validateAndCalculateCoupon(input.couponCode, subtotal);
    if (!couponEval.valid) {
      return { success: false, error: couponEval.error || 'Mã giảm giá không hợp lệ hoặc không áp dụng được.' };
    }
    discountAmount = couponEval.discountAmount || 0;
    verifiedCouponCode = couponEval.appliedCoupon?.code;
  }

  // Tổng giá trị đơn hàng gồm tiền hàng (sau giảm giá) và phí vận chuyển
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const totalAmount = discountedSubtotal + shippingFee;
  const paymentMethod: PaymentMethod = input.paymentMethod === 'payos' ? 'payos' : 'cod';
  const isCod = paymentMethod === 'cod';
  const { orderCode, numericCode } = generateOrderCode(isCod);

  const depositAmount = isCod ? Math.min(100000, totalAmount) : totalAmount;
  const codRemaining = isCod ? Math.max(0, totalAmount - depositAmount) : 0;

  const notesInfo = [
    input.cityId ? `[CityID:${input.cityId}]` : '',
    input.districtId ? `[DistrictID:${input.districtId}]` : '',
    input.wardId ? `[WardID:${input.wardId}]` : '',
    shippingServiceId ? `[ServiceID:${shippingServiceId}]` : '',
    `[Weight:${totalWeightGrams}g]`,
    `[ShippingFee:${shippingFee}đ]`,
    verifiedCouponCode ? `[Voucher:${verifiedCouponCode} (-${discountAmount}đ)]` : '',
    isCod ? `[Yêu cầu cọc 100k: ${depositAmount}đ | Thu COD: ${codRemaining}đ (đã gồm cước ship)]` : '[Đã thanh toán 100% gồm cước ship]',
    input.notes?.trim() || '',
  ].filter(Boolean).join(' ');

  // Dọn dẹp ngầm các checkout nháp đã hết hạn để giải phóng database
  void supabaseAdmin.from('pending_checkouts').delete().lt('expires_at', new Date().toISOString());

  // Lưu thông tin giỏ hàng tạm thời vào pending_checkouts (CHƯA LƯU VÀO ORDERS ĐỂ TRÁNH ĐƠN RÁC)
  const pendingPayload = {
    order_code: orderCode,
    numeric_code: numericCode,
    total_amount: totalAmount,
    subtotal,
    shipping_fee: shippingFee,
    coupon_code: verifiedCouponCode || null,
    discount_amount: discountAmount,
    carrier_name: carrierName,
    payment_method: paymentMethod,
    deposit_amount: isCod ? depositAmount : null,
    cod_remaining: isCod ? codRemaining : null,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    customer_email: input.customerEmail.trim(),
    customer_address: input.customerAddress.trim(),
    city_id: input.cityId || null,
    district_id: input.districtId || null,
    ward_id: input.wardId || null,
    province_code: input.cityId || null,
    district_code: input.districtId || null,
    ward_code: input.wardId || null,
    notes: notesInfo || null,
    items: validItems,
  };

  const { error: draftErr } = await supabaseAdmin.from('pending_checkouts').insert(pendingPayload);
  if (draftErr) {
    console.error('[Pending Checkout Error]:', draftErr);
    return { success: false, error: 'Không thể khởi tạo thông tin đơn hàng lúc này.' };
  }

  // PayOS (100% cả ship) hoặc COD (cọc 100k) tạo link PayOS QR
  try {
    const payAmount = isCod ? depositAmount : totalAmount;
    const payosResponse = await createPayOSLink(
      numericCode,
      payAmount,
      validItems,
      isCod ? 0 : shippingFee,
      input,
      isCod,
      carrierName,
      discountAmount
    );
    return {
      success: true,
      orderCode,
      subtotal,
      shippingFee,
      totalAmount,
      couponCode: verifiedCouponCode,
      discountAmount,
      paymentMethod,
      depositAmount: isCod ? depositAmount : undefined,
      payos: {
        checkoutUrl: payosResponse.checkoutUrl,
        qrCode: payosResponse.qrCode,
        accountNumber: payosResponse.accountNumber,
        accountName: payosResponse.accountName,
        bin: payosResponse.bin,
        numericOrderCode: payosResponse.orderCode,
        amount: payosResponse.amount,
        description: payosResponse.description,
      },
    };
  } catch (payosError: any) {
    console.error('Lỗi khi tạo payment link PayOS:', payosError);
    await supabaseAdmin.from('pending_checkouts').delete().eq('numeric_code', numericCode);
    return {
      success: false,
      error: `Không thể khởi tạo mã QR thanh toán lúc này: ${payosError?.message || 'Lỗi kết nối PayOS'}`,
    };
  }
}

export async function cancelPendingCheckoutAction(orderCode: string): Promise<{ success: boolean }> {
  try {
    const numericMatch = orderCode.match(/\d+/);
    if (numericMatch) {
      await supabaseAdmin.from('pending_checkouts').delete().eq('numeric_code', Number(numericMatch[0]));
    } else {
      await supabaseAdmin.from('pending_checkouts').delete().eq('order_code', orderCode);
    }
    return { success: true };
  } catch (err) {
    console.error('[Cancel Pending Checkout Error]:', err);
    return { success: false };
  }
}

export async function lookupOrderAction(query: string) {
  const clean = query.trim();
  if (!clean) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .or(`order_code.ilike.%${clean}%,customer_phone.eq.${clean},customer_email.eq.${clean},tracking_code.eq.${clean},allingo_track_id.eq.${clean}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('[Lookup Order Action Error]:', err);
    return null;
  }
}



