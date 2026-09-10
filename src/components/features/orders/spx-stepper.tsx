import React from 'react';
import { Package, Truck, CheckCircle2, RotateCcw, Box } from 'lucide-react';
import { SPXStatusCategory } from '@/types/spx';
import { cn } from '@/lib/utils';

interface SPXStepperProps {
  statusCategory: SPXStatusCategory;
  milestoneCode?: number;
  isLastMile?: boolean;
}

export function SPXStepper({ statusCategory, milestoneCode = 0, isLastMile = false }: SPXStepperProps) {
  const isDelivered = statusCategory === 'delivered' || milestoneCode === 8;
  const isReturned = statusCategory === 'returned' || milestoneCode === 10;
  const isPreparing = statusCategory === 'preparing' || milestoneCode === 1;

  // Step index: 0 = preparing, 1 = in transit, 2 = delivering, 3 = delivered/returned
  let activeStep = 0;
  if (isDelivered || isReturned) {
    activeStep = 3;
  } else if (isLastMile || milestoneCode === 7) {
    activeStep = 2;
  } else if (!isPreparing && milestoneCode >= 2) {
    activeStep = 1;
  }

  const steps = [
    { label: 'Chuẩn bị hàng', icon: Box },
    { label: 'Đang trung chuyển', icon: Truck },
    { label: 'Đang giao hàng', icon: Package },
    {
      label: isReturned ? 'Hoàn trả hàng' : 'Giao thành công',
      icon: isReturned ? RotateCcw : CheckCircle2,
    },
  ];

  const getStepColor = (idx: number) => {
    if (isReturned && idx === 3) return 'bg-rose-500 text-white border-rose-500';
    if (idx <= activeStep) {
      if (isDelivered && idx === 3) return 'bg-emerald-600 text-white border-emerald-600';
      return 'bg-apple-blue text-white border-apple-blue';
    }
    return 'bg-slate-100 text-slate-400 border-slate-200';
  };

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Progress connecting line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0 rounded-full" />
        <div
          className={cn(
            'absolute left-6 top-1/2 -translate-y-1/2 h-1 -z-0 transition-all duration-500 rounded-full',
            isReturned ? 'bg-rose-400' : isDelivered ? 'bg-emerald-500' : 'bg-apple-blue'
          )}
          style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = idx === activeStep;
          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xs',
                  getStepColor(idx),
                  isCurrent && 'ring-4 ring-blue-100 ring-offset-1 scale-110'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium mt-2 text-center whitespace-nowrap max-w-[70px] sm:max-w-none',
                  idx <= activeStep ? 'text-slate-900 font-semibold' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
