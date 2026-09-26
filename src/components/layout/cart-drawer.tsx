'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { formatPrice } from '@/lib/utils';
import { CartLineItem } from './cart-line-item';

export function CartDrawer() {
  const router = useRouter();
  const cart = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!cart.isOpen) return null;

  const handleClose = () => {
    setIsCheckingOut(false);
    cart.closeCart();
  };

  const handleGoToCart = () => {
    handleClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-label="Đóng giỏ hàng"
      />

      {/* Slide-out Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isCheckingOut ? 'Thông tin nhận hàng' : 'Giỏ hàng'}
        className="relative z-10 flex h-full h-[100dvh] w-[88vw] max-w-[340px] sm:w-full sm:max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200"
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
            <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-neutral-900" aria-hidden="true" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Giỏ hàng ({cart.totalItems})
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                aria-label="Đóng giỏ hàng"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-3.5 sm:p-5">
              {cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 mx-auto">
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3.5 text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Giỏ hàng đang trống
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-neutral-500">
                    Chọn sản phẩm phù hợp để bắt đầu đơn hàng.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 py-2 px-5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    Tiếp tục mua sắm
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.items.map((item) => (
                    <CartLineItem
                      key={`${item.productId}-${item.flavor.id}-${item.size?.id || 'default'}`}
                      item={item}
                      onRemove={() => cart.removeItem(item.productId, item.flavor.id, item.size?.id)}
                      onUpdateQuantity={(delta) => cart.updateQuantity(item.productId, item.flavor.id, item.size?.id, delta)}
                    />
                  ))}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <footer className="space-y-2.5 border-t border-neutral-200 bg-white p-3.5 sm:p-5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Tạm tính ({cart.totalItems} món)
                  </span>
                  <span className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                    {formatPrice(cart.totalAmount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoToCart}
                  className="w-full rounded-full bg-neutral-900 hover:bg-black text-white py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Xem giỏ hàng</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
