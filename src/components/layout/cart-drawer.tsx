'use client';

import { useState } from 'react';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { CartLineItem } from './cart-line-item';

export function CartDrawer() {
  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!cart.isOpen) return null;

  const handleClose = () => {
    setIsCheckingOut(false);
    cart.closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Đóng giỏ hàng"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isCheckingOut ? 'Thông tin nhận hàng' : 'Giỏ hàng'}
          className="flex w-screen max-w-md flex-col bg-white shadow-2xl"
        >
          {isCheckingOut ? (
            <CheckoutForm
              items={cart.items}
              onBack={() => setIsCheckingOut(false)}
              onComplete={handleClose}
              onSuccess={cart.clearCart}
            />
          ) : (
            <>
              <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-apple-blue" aria-hidden="true" />
                  <h2 className="text-base font-semibold text-slate-950">Giỏ hàng ({cart.totalItems})</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="grid h-11 w-11 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Đóng giỏ hàng"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                {cart.items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                    <ShoppingBag className="h-10 w-10 text-slate-300" aria-hidden="true" />
                    <p className="mt-4 font-medium text-slate-900">Giỏ hàng đang trống</p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Chọn sản phẩm phù hợp để bắt đầu đơn hàng.</p>
                    <Button type="button" onClick={handleClose} className="mt-6">Tiếp tục mua sắm</Button>
                  </div>
                ) : (
                  cart.items.map((item) => (
                    <CartLineItem
                      key={`${item.productId}-${item.flavor.id}-${item.size?.id || 'default'}`}
                      item={item}
                      onRemove={() => cart.removeItem(item.productId, item.flavor.id, item.size?.id)}
                      onUpdateQuantity={(delta) => cart.updateQuantity(item.productId, item.flavor.id, item.size?.id, delta)}
                    />
                  ))
                )}
              </div>

              {cart.items.length > 0 && (
                <footer className="space-y-4 border-t border-slate-200 bg-white p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Tạm tính</span>
                    <span className="text-xl font-semibold text-slate-950">{formatPrice(cart.totalAmount)}</span>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">Giá và tồn kho sẽ được xác nhận lại khi đặt hàng.</p>
                  <Button type="button" size="lg" onClick={() => setIsCheckingOut(true)} className="w-full rounded-xl bg-apple-dark hover:bg-black text-white">
                    <span>Tiến hành đặt hàng</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </footer>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
