'use client';

/** True when the visitor asked for less motion. Read at the moment of use: only call it from an event or an effect. */
export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Writes to the clipboard and says whether it worked, so callers never report a copy that did not happen. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

interface Tweened extends HTMLElement { phValue?: number; phFrame?: number }

/** Tweens a number shown in `el` straight in the DOM, so a tween never re-renders React. */
export function tween(el: HTMLElement, to: number, format: (n: number) => string, ms = 420) {
  const node = el as Tweened;
  const from = node.phValue ?? to;
  node.phValue = to;
  if (node.phFrame) cancelAnimationFrame(node.phFrame);
  if (calm() || from === to) { node.textContent = format(to); return; }
  const start = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - start) / ms);
    node.textContent = format(from + (to - from) * (1 - (1 - p) ** 3));
    if (p < 1) node.phFrame = requestAnimationFrame(step);
  };
  node.phFrame = requestAnimationFrame(step);
}
