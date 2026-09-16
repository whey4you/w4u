'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/server';
import { CheckoutInput, CheckoutItemInput, CheckoutResult } from '@/types/checkout';

interface ProductRow {
  id: string;
  name: string;
  price: number;
  default_image: string;
  in_stock: boolean;
  product_flavors: { id: string; name: string; image?: string }[];
  product_sizes: {
    id: string;
    price: number;
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
}

function validateCustomer(input: CheckoutInput): string | null {
  const phone = input.customerPhone.replace(/[\s.-]/g, '');
  if (input.customerName.trim().length < 2) return 'Vui lòng nhập họ tên hợp lệ.';
  if (!/^(?:\+84|0)\d{9}$/.test(phone)) return 'Số điện thoại chưa đúng định dạng Việt Nam.';
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

  return {
    product_id: product.id,
    product_name: product.name,
    flavor_name: flavor.name,
    price: unitPrice,
    quantity: item.quantity,
    image: flavor.image || product.default_image,
  };
}

async function loadProducts(items: CheckoutItemInput[]) {
  const ids = Array.from(new Set(items.map(({ productId }) => productId)));
  return supabaseAdmin
    .from('products')
    .select('id,name,price,default_image,in_stock,product_flavors(id,name,image),product_sizes(id,price,in_stock,flavor_prices)')
    .in('id', ids);
}

function createOrderCode() {
  const timestamp = Date.now().toString().slice(-7);
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `W4U-${timestamp}-${suffix}`;
}

export async function createOrderAction(input: CheckoutInput): Promise<CheckoutResult> {
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
  const totalAmount = validItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const orderCode = createOrderCode();
  const { data: order, error: orderError } = await supabaseAdmin.from('orders').insert({
    order_code: orderCode,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    customer_address: input.customerAddress.trim(),
    total_amount: totalAmount,
    payment_method: 'cod',
    notes: input.notes?.trim() || null,
  }).select('id').single();

  if (orderError || !order) return { success: false, error: 'Không thể tạo đơn hàng lúc này.' };
  const { error: itemError } = await supabaseAdmin.from('order_items').insert(
    validItems.map((item) => ({ ...item, order_id: order.id }))
  );
  if (itemError) {
    await supabaseAdmin.from('orders').delete().eq('id', order.id);
    return { success: false, error: 'Không thể lưu chi tiết đơn hàng.' };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { success: true, orderCode, totalAmount };
}
