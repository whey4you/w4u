'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { assertAdminSession } from '@/lib/auth/admin-guard';
import { revalidatePath } from 'next/cache';
import { Product } from '@/types/product';
import { slugify, parseWeightKg } from '@/lib/utils';

export interface MutationResult {
  success: boolean;
  error?: string;
  id?: string;
}

function getPrimaryPrice(payload: Partial<Product>) {
  const primarySize = payload.sizes?.[0];
  const price = primarySize?.price ?? payload.price ?? 0;
  const originalPrice = primarySize?.originalPrice ?? payload.originalPrice;
  const discountPercent = originalPrice && price && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  return { price, originalPrice, discountPercent };
}

async function syncProductDetails(id: string, payload: Partial<Product>) {
  if (payload.macros) {
    const baseMacroRecord = {
      product_id: id,
      protein: payload.macros.protein || '25g',
      servings: payload.macros.servings || 50,
      bcaa: payload.macros.bcaa || '',
      calories: payload.macros.calories || '',
      sugar: payload.macros.sugar || '',
    };

    const extendedMacroRecord = {
      ...baseMacroRecord,
      protein_label: payload.macros.proteinLabel || null,
      bcaa_label: payload.macros.bcaaLabel || null,
      calories_label: payload.macros.caloriesLabel || null,
      sugar_label: payload.macros.sugarLabel || null,
      servings_label: payload.macros.servingsLabel || null,
      nutrition_table: payload.macros.nutritionTable || [],
      ingredients: payload.macros.ingredients || null,
      allergens: payload.macros.allergens || null,
    };

    const { error } = await supabaseAdmin.from('product_macros').upsert(extendedMacroRecord);
    if (error && error.message?.includes('column of \'product_macros\' in the schema cache')) {
      await supabaseAdmin.from('product_macros').upsert(baseMacroRecord);
    }
  }

  if (payload.flavors) {
    await supabaseAdmin.from('product_flavors').delete().eq('product_id', id);
    if (payload.flavors.length > 0) {
      await supabaseAdmin.from('product_flavors').insert(payload.flavors.map((flavor) => ({
        product_id: id,
        id: flavor.id || slugify(flavor.name),
        name: flavor.name,
        color_hex: flavor.colorHex || '#0071e3',
        image: flavor.image || null,
        in_stock: flavor.inStock !== false,
      })));
    }
  }

  if (payload.sizes) {
    await supabaseAdmin.from('product_sizes').delete().eq('product_id', id);
    if (payload.sizes.length > 0) {
      const records = payload.sizes.map((size, index) => ({
        product_id: id,
        id: size.id || slugify(size.name),
        name: size.name,
        servings: size.servings || 60,
        price: size.price,
        original_price: size.originalPrice || null,
        flavor_prices: size.flavorPrices || {},
        in_stock: size.inStock !== false,
        sort_order: index,
        weight_kg: Number(size.weightKg) > 0 ? Number(size.weightKg) : parseWeightKg(size.name, 1.0),
      }));

      let { error } = await supabaseAdmin.from('product_sizes').insert(records);
      if (error && error.message?.includes('weight_kg')) {
        const legacy = records.map(({ weight_kg, ...rest }) => rest);
        const retry = await supabaseAdmin.from('product_sizes').insert(legacy);
        error = retry.error;
      }
      if (error && error.message?.includes('flavor_prices')) {
        const legacyRecords = records.map(({ flavor_prices, weight_kg, ...rest }) => rest);
        const retry = await supabaseAdmin.from('product_sizes').insert(legacyRecords);
        error = retry.error;
      }
      if (error) {
        console.error('Lỗi khi lưu product_sizes:', error);
      }
    }
  }
}

function revalidateProductPaths(slug?: string) {
  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export async function toggleProductStock(id: string, inStock: boolean): Promise<MutationResult> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Phiên làm việc hết hạn hoặc không có quyền quản trị.' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ in_stock: inStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateProductPaths();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi cập nhật trạng thái kho.' };
  }
}

export async function bulkToggleProductStock(id: string, inStock: boolean): Promise<MutationResult> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Phiên làm việc hết hạn hoặc không có quyền quản trị.' };
  }

  try {
    await supabaseAdmin
      .from('products')
      .update({ in_stock: inStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    await supabaseAdmin
      .from('product_sizes')
      .update({ in_stock: inStock })
      .eq('product_id', id);

    await supabaseAdmin
      .from('product_flavors')
      .update({ in_stock: inStock })
      .eq('product_id', id);

    revalidateProductPaths();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi cập nhật trạng thái kho toàn bộ.' };
  }
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<MutationResult> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Phiên làm việc hết hạn hoặc không có quyền quản trị.' };
  }

  try {
    const pricing = getPrimaryPrice(payload);
    const updateData: Record<string, any> = {
      name: payload.name,
      brand: payload.brand,
      category: payload.category,
      price: pricing.price,
      original_price: pricing.originalPrice,
      discount_percent: pricing.discountPercent,
      badge: payload.badge,
      weight_kg: Number(payload.weightKg) > 0 ? Number(payload.weightKg) : 1.0,
      default_image: payload.defaultImage,
      images: payload.images || [],
      slug: payload.slug || (payload.name ? slugify(payload.name) : undefined),
      description: payload.description,
      how_to_use: payload.howToUse,
      faq: payload.faq || [],
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabaseAdmin.from('products').update(updateData).eq('id', id);
    if (error && error.message?.includes('weight_kg')) {
      delete updateData.weight_kg;
      const retry = await supabaseAdmin.from('products').update(updateData).eq('id', id);
      error = retry.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    await syncProductDetails(id, payload);
    revalidateProductPaths(payload.slug);
    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    return { success: false, error: error?.message || 'Lỗi hệ thống khi cập nhật sản phẩm.' };
  }
}

export async function createProduct(payload: Partial<Product>): Promise<MutationResult> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Phiên làm việc hết hạn hoặc không có quyền quản trị.' };
  }

  try {
    const id = payload.id || `prod-${Date.now()}`;
    const slug = payload.slug || (payload.name ? slugify(payload.name) : id);
    const pricing = getPrimaryPrice(payload);
    const insertData: Record<string, any> = {
      id,
      name: payload.name,
      brand: payload.brand,
      category: payload.category || 'whey',
      price: pricing.price || 0,
      original_price: pricing.originalPrice || null,
      discount_percent: pricing.discountPercent,
      weight_kg: Number(payload.weightKg) > 0 ? Number(payload.weightKg) : 1.0,
      default_image: payload.defaultImage || '/products/r1-protein.jpg',
      images: payload.images || [],
      badge: payload.badge || null,
      slug,
      description: payload.description || '',
      how_to_use: payload.howToUse || '',
      faq: payload.faq || [],
      in_stock: true,
    };

    let { error } = await supabaseAdmin.from('products').insert(insertData);
    if (error && error.message?.includes('weight_kg')) {
      delete insertData.weight_kg;
      const retry = await supabaseAdmin.from('products').insert(insertData);
      error = retry.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }

    await syncProductDetails(id, payload);
    revalidateProductPaths(slug);
    return { success: true, id };
  } catch (error: any) {
    console.error('Lỗi khi tạo sản phẩm mới:', error);
    return { success: false, error: error?.message || 'Lỗi hệ thống khi tạo sản phẩm mới.' };
  }
}

export async function deleteProduct(id: string): Promise<MutationResult> {
  const isAdmin = await assertAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Phiên làm việc hết hạn hoặc không có quyền quản trị.' };
  }

  try {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }

    revalidateProductPaths();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi khi xóa sản phẩm.' };
  }
}
