'use client';

import React, { createContext, useContext, useState } from 'react';
import { CartItem } from '@/types/product';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function isSameCartLine(item: CartItem, productId: string, flavorId: string, sizeId?: string) {
  return item.productId === productId
    && item.flavor.id === flavorId
    && item.size?.id === sizeId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        clearCart: () => setItems([]),
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalAmount,
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
