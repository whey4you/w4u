import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export function RatingStars({ rating, reviewCount, className }: RatingStarsProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 text-xs', className)}>
      <div className="flex items-center text-amber-500">
        <Star className="h-3.5 w-3.5 fill-current" />
      </div>
      <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-slate-500">({reviewCount})</span>
      )}
    </div>
  );
}
