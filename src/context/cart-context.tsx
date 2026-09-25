'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CartItem } from '@/types/product';
import { AppliedCoupon } from '@/types/coupon';

const CART_STORAGE_KEY = 'whey4you_cart_v1';
const COUPON_STORAGE_KEY = 'whey4you_applied_coupon_v1';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string, flavorId: string, sizeId?: string) => void;
  updateQuantity: (productId: string, flavorId: string, sizeId: string | undefined, delta: number) => void;
  totalItems: number;
  totalAmount: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isSameCartLine(item: CartItem, productId: string, flavorId: string, sizeId?: string) {
  return item.productId === productId
    && item.flavor.id === flavorId
    && item.size?.id === sizeId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isHydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch (err) {
      console.error('Lỗi khi đọc giỏ hàng:', err);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Lỗi khi lưu giỏ hàng:', err);
    }
  }, [items, appliedCoupon]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => isSameCartLine(
          item,
          newItem.productId,
          newItem.flavor.id,
          newItem.size?.id
        )
      );
      if (existing) {
        return prev.map((item) =>
          isSameCartLine(item, newItem.productId, newItem.flavor.id, newItem.size?.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...newItem, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, flavorId: string, sizeId?: string) => {
    setItems((prev) =>
      prev.filter((item) => !isSameCartLine(item, productId, flavorId, sizeId))
    );
  };

  const updateQuantity = (
    productId: string,
    flavorId: string,
    sizeId: string | undefined,
    delta: number
  ) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (isSameCartLine(item, productId, flavorId, sizeId)) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Tính lại tiền giảm giá theo giá trị giỏ hàng thực tế
  let discountAmount = 0;
  if (appliedCoupon && totalAmount >= (appliedCoupon.minOrderValue || 0)) {
    if (appliedCoupon.discountType === 'fixed') {
      discountAmount = Math.min(appliedCoupon.discountValue, totalAmount);
    } else if (appliedCoupon.discountType === 'percent') {
      const raw = (totalAmount * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && appliedCoupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(raw, appliedCoupon.maxDiscountAmount);
      } else {
        discountAmount = raw;
      }
    }
    discountAmount = Math.max(0, Math.min(Math.round(discountAmount), totalAmount));
  }

  const finalTotal = Math.max(0, totalAmount - discountAmount);

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        clearCart,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalAmount,
        appliedCoupon,
        applyCoupon: (coupon: AppliedCoupon) => setAppliedCoupon(coupon),
        removeCoupon: () => setAppliedCoupon(null),
        discountAmount,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
