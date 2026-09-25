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
                  className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
                  aria-label="Đóng giỏ hàng"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                {cart.items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 mx-auto">
                      <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
                      Giỏ hàng đang trống
                    </p>
                    <p className="mt-1.5 max-w-xs text-xs text-neutral-500">
                      Chọn sản phẩm phù hợp để bắt đầu đơn hàng.
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-5 py-2.5 px-6 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                <footer className="space-y-2.5 border-t border-neutral-200 bg-white p-4 sm:p-6">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Tạm tính ({cart.totalItems} món)
                    </span>
                    <span className="text-lg font-black text-neutral-900 tracking-tight">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoToCart}
                    className="w-full rounded-full bg-neutral-900 hover:bg-black text-white py-3.5 text-sm font-semibold transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
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
    </div>
  );
}
