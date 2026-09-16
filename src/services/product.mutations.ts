import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types/product';
import { slugify } from '@/lib/utils';

function getPrimaryPrice(payload: Partial<Product>) {
  const primarySize = payload.sizes?.[0];
  const price = primarySize?.price ?? payload.price;
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

    const { error } = await supabase.from('product_macros').upsert(extendedMacroRecord);
    if (error && error.message?.includes('column of \'product_macros\' in the schema cache')) {
      await supabase.from('product_macros').upsert(baseMacroRecord);
    }
  }

  if (payload.flavors) {
    await supabase.from('product_flavors').delete().eq('product_id', id);
    if (payload.flavors.length > 0) {
      await supabase.from('product_flavors').insert(payload.flavors.map((flavor) => ({
        product_id: id,
        id: flavor.id || slugify(flavor.name),
        name: flavor.name,
        color_hex: flavor.colorHex || '#0071e3',
        image: flavor.image || null,
      })));
    }
  }

  if (payload.sizes) {
    await supabase.from('product_sizes').delete().eq('product_id', id);
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
      }));

      const { error } = await supabase.from('product_sizes').insert(records);
      if (error && error.message?.includes('flavor_prices')) {
        // Fallback cho schema cũ nếu chưa có cột flavor_prices
        const legacyRecords = records.map(({ flavor_prices, ...rest }) => rest);
        await supabase.from('product_sizes').insert(legacyRecords);
      }
    }
  }
}

export async function toggleProductStock(id: string, inStock: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ in_stock: inStock, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<boolean> {
  try {
    const pricing = getPrimaryPrice(payload);
    const { error } = await supabase.from('products').update({
      name: payload.name,
      brand: payload.brand,
      category: payload.category,
      price: pricing.price,
      original_price: pricing.originalPrice,
      discount_percent: pricing.discountPercent,
      badge: payload.badge,
      default_image: payload.defaultImage,
      images: payload.images || [],
      slug: payload.slug || (payload.name ? slugify(payload.name) : undefined),
      description: payload.description,
      how_to_use: payload.howToUse,
      faq: payload.faq || [],
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) return false;
    await syncProductDetails(id, payload);
    return true;
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    return false;
  }
}

export async function createProduct(payload: Partial<Product>): Promise<boolean> {
  try {
    const id = payload.id || `prod-${Date.now()}`;
    const slug = payload.slug || (payload.name ? slugify(payload.name) : id);
    const pricing = getPrimaryPrice(payload);
    const { error } = await supabase.from('products').insert({
      id,
      name: payload.name,
      brand: payload.brand,
      category: payload.category || 'whey',
      price: pricing.price || 0,
      original_price: pricing.originalPrice || null,
      discount_percent: pricing.discountPercent,
      default_image: payload.defaultImage || '/products/r1-protein.jpg',
      images: payload.images || [],
      badge: payload.badge || null,
      slug,
      description: payload.description || '',
      how_to_use: payload.howToUse || '',
      faq: payload.faq || [],
      in_stock: true,
    });

    if (error) return false;
    await syncProductDetails(id, payload);
    return true;
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm mới:', error);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
