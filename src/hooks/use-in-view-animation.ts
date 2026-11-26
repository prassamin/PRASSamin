"use client";

import { useEffect, useRef } from "react";

let sharedObserver: IntersectionObserver | null = null;
const callbacks = new Map<Element, (isInView: boolean) => void>();

function getSharedObserver(rootMargin: string): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  // If observer exists with matching rootMargin, reuse it
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = callbacks.get(entry.target);
          if (cb) {
            cb(entry.isIntersecting);
          }
        }
      },
      { rootMargin }
    );
  }

  return sharedObserver;
}

/**
 * Attaches a singleton IntersectionObserver to the element.
 * Sets `data-in-view="true"` when within 200px of viewport, and `"false"` when offscreen.
 * Combined with CSS `[data-in-view="false"] * { animation-play-state: paused }`,
 * this completely freezes offscreen SVG loops without React re-renders or layout shifts.
 */
export function useInViewAnimationRef<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "200px 0px"
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver(rootMargin);
    if (!observer) return;

    const onIntersection = (isInView: boolean) => {
      el.dataset.inView = isInView ? "true" : "false";
    };

    callbacks.set(el, onIntersection);
    observer.observe(el);

    return () => {
      callbacks.delete(el);
      observer.unobserve(el);
    };
  }, [rootMargin]);

  return ref;
}
