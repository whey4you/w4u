'use client';

import { useRef, useCallback } from 'react';

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  wheelCooldownMs?: number;
  disabled?: boolean;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 25,
  wheelCooldownMs = 320,
  disabled = false,
}: UseSwipeGestureOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const hasSwiped = useRef(false);
  const lastWheelTime = useRef(0);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      hasSwiped.current = false;
    },
    [disabled]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || touchStartX.current === null || touchStartY.current === null) return;
      const diffX = e.changedTouches[0].clientX - touchStartX.current;
      const diffY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        hasSwiped.current = true;
        if (diffX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
        setTimeout(() => {
          hasSwiped.current = false;
        }, 80);
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
    [disabled, onSwipeLeft, onSwipeRight, threshold]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      mouseStartX.current = e.clientX;
      isDragging.current = true;
      hasSwiped.current = false;
    },
    [disabled]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !isDragging.current || mouseStartX.current === null) return;
      const diffX = e.clientX - mouseStartX.current;
      if (Math.abs(diffX) > threshold + 5) {
        hasSwiped.current = true;
        if (diffX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
        setTimeout(() => {
          hasSwiped.current = false;
        }, 80);
      }
      isDragging.current = false;
      mouseStartX.current = null;
    },
    [disabled, onSwipeLeft, onSwipeRight, threshold]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (disabled) return;
      if (Math.abs(e.deltaX) > threshold && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const now = Date.now();
        if (now - lastWheelTime.current > wheelCooldownMs) {
          lastWheelTime.current = now;
          if (e.deltaX > 0) {
            onSwipeLeft?.();
          } else {
            onSwipeRight?.();
          }
        }
      }
    },
    [disabled, onSwipeLeft, onSwipeRight, threshold, wheelCooldownMs]
  );

  return {
    hasSwiped,
    onTouchStart,
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    onWheel,
  };
}
