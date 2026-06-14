"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

interface Options {
  /** ScrollTrigger start position. Default "top 78%". */
  start?: string;
  /** Fire only the first time the element enters. Default true. */
  once?: boolean;
}

/**
 * Reusable GSAP ScrollTrigger setup.
 * Calls `onEnter` when `ref` scrolls into view. When the user prefers reduced
 * motion, `onEnter` fires immediately so the final (static) state is served.
 */
export function useScrollAnimation(
  ref: RefObject<HTMLElement | null>,
  onEnter: () => void,
  options: Options = {}
) {
  // keep the latest callback without re-creating the trigger
  const cb = useRef(onEnter);
  cb.current = onEnter;

  const { start = "top 78%", once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      cb.current();
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once,
      onEnter: () => cb.current(),
    });

    return () => trigger.kill();
  }, [ref, start, once]);
}
