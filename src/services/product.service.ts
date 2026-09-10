import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types/product';
import { mapRowToProduct, RawProductRow } from './product.mapper';

/** Raw catalog for consumers that must distinguish missing facts from display defaults. */
export async function getProductCatalogRows(signal?: AbortSignal): Promise<unknown[]> {
  const request = supabase.from('products')
    .select('*, product_macros(*), product_flavors(*), product_goals(*), product_sizes(*)')
    .order('created_at', { ascending: false });
  const { data, error } = await (signal ? request.abortSignal(signal) : request);
  if (error) throw error;
  if (!data) throw new Error('Product catalog unavailable.');
  return data;
}

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const data = await getProductCatalogRows();
    if (data.length === 0) return [];
    return (data as RawProductRow[]).map(mapRowToProduct);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    let { data, error } = await supabase
      .from('products')
      .select('*, product_macros(*), product_flavors(*), product_goals(*), product_sizes(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      const res = await supabase
        .from('products')
        .select('*, product_macros(*), product_flavors(*), product_goals(*), product_sizes(*)')
        .eq('id', slug)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error || !data) {
      return null;
    }
    return mapRowToProduct(data as RawProductRow);
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết sản phẩm theo slug:', err);
    return null;
  }
}
