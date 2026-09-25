'use client';

import React from 'react';
import { MapPin, Truck, CreditCard, FileCheck, Check } from 'lucide-react';
import { CheckoutStep } from '@/hooks/use-checkout-flow';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
}

const steps = [
  { id: 1 as CheckoutStep, label: 'Địa chỉ nhận hàng', icon: MapPin },
  { id: 2 as CheckoutStep, label: 'Phương thức giao', icon: Truck },
  { id: 3 as CheckoutStep, label: 'Thanh toán', icon: CreditCard },
  { id: 4 as CheckoutStep, label: 'Hóa đơn & QR', icon: FileCheck },
];

export function CheckoutStepper({ currentStep, onStepClick }: CheckoutStepperProps) {
  return (
    <nav aria-label="Tiến trình đặt hàng" className="w-full py-4">
      <ol className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-apple-blue transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = step.id < currentStep && currentStep !== 4;
          const Icon = step.icon;

          return (
            <li key={step.id} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-apple-blue bg-apple-blue text-white cursor-pointer hover:bg-apple-blue-hover'
                    : isCurrent
                    ? 'border-apple-blue bg-white text-apple-blue ring-4 ring-blue-50 shadow-sm'
                    : 'border-slate-300 bg-white text-slate-400 cursor-not-allowed'
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5 stroke-[2.5]" /> : <Icon className="h-5 w-5" />}
              </button>
              <span
                className={`mt-2 text-[11px] sm:text-xs font-semibold tracking-tight hidden sm:block ${
                  isCurrent ? 'text-apple-blue' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
