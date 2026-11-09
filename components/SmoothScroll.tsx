'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';

/** The same smooth wheel scrolling as promohive.org. Touch keeps native scrolling, and it stays off for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: true, allowNestedScroll: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
