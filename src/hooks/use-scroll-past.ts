'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when a target element has been scrolled past (exited the top of the viewport).
 * Returns { targetRef, isScrolledPast }.
 */
export function useScrollPast<T extends HTMLElement = HTMLDivElement>() {
  const targetRef = useRef<T>(null);
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only consider scrolled past when the element is NOT intersecting AND has passed above the viewport
        const hasPassedAbove = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        setIsScrolledPast(hasPassedAbove);
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { targetRef, isScrolledPast };
}
