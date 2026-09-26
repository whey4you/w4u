'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { useCheckoutFlow } from '@/hooks/use-checkout-flow';
import { CheckoutStepShipping } from './checkout-step-shipping';
import { CheckoutStepDelivery } from './checkout-step-delivery';
import { CheckoutStepPayment } from './checkout-step-payment';
import { CheckoutSummarySidebar } from './checkout-summary-sidebar';
import { CheckoutBillReceipt } from './checkout-bill-receipt';
import { CheckoutMobileOrderSummary } from './checkout-mobile-order-summary';

export function CheckoutPageContent() {
  const { items, totalAmount, clearCart, appliedCoupon, discountAmount } = useCart();
  const flow = useCheckoutFlow(items, totalAmount, clearCart, appliedCoupon?.code, discountAmount);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // If cart is empty and not on step 4 (after successful order)
  if (items.length === 0 && flow.step !== 4) {
    return (
      <main className="min-h-[75vh] flex items-center justify-center py-16">
        <Container className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-neutral-500">Vui lòng chọn sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.</p>
          <div className="pt-2">
            <Link href="/products">
              <Button size="lg" className="rounded-full px-7 bg-neutral-900 hover:bg-black text-white text-xs font-semibold">
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Distraction-free Editorial Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 print:hidden">
        <Container className="max-w-6xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {flow.step === 4 ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new PopStateEvent('popstate'))}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Giỏ hàng</span>
              </button>
            ) : (
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Giỏ hàng</span>
              </Link>
            )}

            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

            <Link href="/" className="relative h-7 w-32">
              <Image src="/logo-brand.webp" alt="Whey4You" fill sizes="128px" className="object-contain object-left" />
            </Link>
          </div>
        </Container>
      </header>

      {/* Main Content Area */}
      <Container className="max-w-6xl pt-6 sm:pt-10">
        {flow.step === 4 && flow.result && flow.result.success ? (
          <CheckoutBillReceipt
            result={flow.result}
            items={flow.orderedItems.length > 0 ? flow.orderedItems : items}
            customer={flow.customer}
            addressData={flow.addressData}
            paymentMethod={flow.paymentMethod}
            shippingFee={flow.result.shippingFee ?? flow.shippingFee ?? 0}
            onPaidSuccess={clearCart}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Stream: Progressive Accordion (Nike Pattern) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Mobile-Only Collapsible Order Summary Above Step 1 */}
              <CheckoutMobileOrderSummary
                items={items}
                totalAmount={totalAmount}
                shippingFee={flow.shippingFee}
                loadingShipping={flow.loadingShipping}
                paymentMethod={flow.paymentMethod}
                carrierName={flow.carrierInfo.carrierName}
                isOpen={isMobileSummaryOpen}
                onToggle={() => setIsMobileSummaryOpen((prev) => !prev)}
              />

              {/* Steps container: Any interaction inside steps automatically collapses the mobile summary */}
              <div
                onClickCapture={() => {
                  if (isMobileSummaryOpen) setIsMobileSummaryOpen(false);
                }}
                className="space-y-4"
              >
                {/* Step 1: Shipping Address */}
                <CheckoutStepShipping
                  isActive={flow.step === 1}
                  isCompleted={flow.step > 1}
                  customer={flow.customer}
                  setCustomer={flow.setCustomer}
                  addressData={flow.addressData}
                  onAddressChange={flow.setAddressData}
                  onNext={flow.goToNextStep}
                  onEdit={() => {
                    setIsMobileSummaryOpen(false);
                    flow.goToStep(1);
                  }}
                  errorMsg={flow.errorMsg}
                />

                {/* Step 2: Delivery Options */}
                <CheckoutStepDelivery
                  isActive={flow.step === 2}
                  isCompleted={flow.step > 2}
                  shippingFee={flow.shippingFee}
                  loadingShipping={flow.loadingShipping}
                  carrierInfo={flow.carrierInfo}
                  availableRates={flow.availableRates}
                  selectedRate={flow.selectedRate}
                  onSelectRate={flow.selectRate}
                  totalWeightGrams={flow.totalWeightGrams}
                  onNext={flow.goToNextStep}
                  onEdit={() => {
                    setIsMobileSummaryOpen(false);
                    flow.goToStep(2);
                  }}
                />

                {/* Step 3: Payment Method */}
                <CheckoutStepPayment
                  isActive={flow.step === 3}
                  paymentMethod={flow.paymentMethod}
                  setPaymentMethod={flow.setPaymentMethod}
                  submitting={flow.submitting}
                  errorMsg={flow.errorMsg}
                  onSubmit={flow.submitOrder}
                />
              </div>
            </div>

            {/* Right Sticky Summary Column - Desktop Only */}
            <div className="hidden lg:block lg:col-span-5">
              <CheckoutSummarySidebar
                items={items}
                totalAmount={totalAmount}
                shippingFee={flow.shippingFee}
                loadingShipping={flow.loadingShipping}
                paymentMethod={flow.paymentMethod}
                carrierName={flow.carrierInfo.carrierName}
              />
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
