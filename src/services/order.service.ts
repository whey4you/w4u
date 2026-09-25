import { supabase } from '@/lib/supabase/client';

export type OrderStatus = 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  flavor_name?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  total_amount: number;
  status: OrderStatus;
  payment_method?: string;
  notes?: string;
  created_at: string;
  deposit_amount?: number;
  cod_remaining?: number;
  tracking_code?: string;
  carrier_name?: string;
  allingo_order_id?: string;
  allingo_track_id?: string;
  tracking_url?: string;
  shipping_fee?: number;
  coupon_code?: string;
  discount_amount?: number;
  order_items?: OrderItem[];
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  city_id?: string;
  district_id?: string;
  ward_id?: string;
}

export async function getAdminOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Không lấy được đơn hàng từ Supabase:', error?.message);
      return [];
    }
    return data as Order[];
  } catch (err) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return !error;
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái đơn:', err);
    return false;
  }
}

export async function getOrderStats() {
  try {
    const orders = await getAdminOrders();
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
  } catch (err) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      shippingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    };
  }
}

export async function getOrderByCodeOrPhone(query: string): Promise<Order | null> {
  try {
    const clean = query.trim();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`order_code.ilike.%${clean}%,customer_phone.eq.${clean},customer_email.eq.${clean},tracking_code.eq.${clean},allingo_track_id.eq.${clean}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();


    if (error || !data) return null;
    return data as Order;
  } catch (err) {
    console.error('Lỗi khi tra cứu đơn hàng:', err);
    return null;
  }
}
