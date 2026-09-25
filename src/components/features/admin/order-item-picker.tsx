'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { AdminOrderItemInput } from '@/app/actions/admin-order.actions';
import { formatPrice } from '@/lib/utils';

interface OrderItemPickerProps {
  products: Product[];
  items: AdminOrderItemInput[];
  onChange: (items: AdminOrderItemInput[]) => void;
}

export function OrderItemPicker({ products, items, onChange }: OrderItemPickerProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>('');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    setSelectedFlavorId(prod?.flavors?.[0]?.id || '');
    setSelectedSizeId(prod?.sizes?.[0]?.id || '');
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const flavor = selectedProduct.flavors?.find((f) => f.id === selectedFlavorId) || selectedProduct.flavors?.[0];
    const size = selectedProduct.sizes?.find((s) => s.id === selectedSizeId);

    let unitPrice = size ? Number(size.price) : Number(selectedProduct.price);
    if (size?.flavorPrices && flavor && size.flavorPrices[flavor.id]) {
      unitPrice = Number(size.flavorPrices[flavor.id].price);
    }

    const weightKg = size?.weightKg ?? selectedProduct.weightKg ?? 1.0;
    const weightGrams = Math.round(weightKg * 1000);
    const flavorName = flavor?.name ? (size ? `${flavor.name} (${size.name})` : flavor.name) : (size?.name || '');

    // Nếu sản phẩm + vị này đã có trong danh sách -> cộng dồn số lượng
    const existingIndex = items.findIndex(
      (item) => item.product_id === selectedProduct.id && (item.flavor_name || '') === flavorName
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      onChange(updated);
    } else {
      const newItem: AdminOrderItemInput = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        flavor_name: flavorName,
        price: unitPrice,
        quantity,
        image: flavor?.image || selectedProduct.defaultImage,
        weight_grams: weightGrams,
      };
      onChange([...items, newItem]);
    }
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = newQty;
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      {/* Selector controls */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
        <label className="text-[11px] font-bold text-slate-700 block uppercase">
          Chọn Sản Phẩm & Quy Cách
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-medium"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Flavors dropdown */}
          {selectedProduct?.flavors && selectedProduct.flavors.length > 0 && (
            <select
              value={selectedFlavorId}
              onChange={(e) => setSelectedFlavorId(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              {selectedProduct.flavors.map((f) => (
                <option key={f.id} value={f.id}>
                  Hương vị: {f.name}
                </option>
              ))}
            </select>
          )}

          {/* Sizes dropdown */}
          {selectedProduct?.sizes && selectedProduct.sizes.length > 0 && (
            <select
              value={selectedSizeId}
              onChange={(e) => setSelectedSizeId(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              {selectedProduct.sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  Kích cỡ: {s.name} ({formatPrice(s.price)})
                </option>
              ))}
            </select>
          )}

          {/* Quantity & Add button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
              <span className="text-[11px] text-slate-400 px-2">SL:</span>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 text-center text-xs p-1.5 focus:outline-none font-bold"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm món</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 p-4 text-center italic">Chưa có sản phẩm nào trong đơn hàng.</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50/60">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-xs truncate">{item.product_name}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {item.flavor_name ? `Vị: ${item.flavor_name} • ` : ''}
                  <span className="text-blue-600 font-bold">{formatPrice(item.price)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                    className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                    className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa món"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
