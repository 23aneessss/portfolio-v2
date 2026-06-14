"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface TypewriterProps {
  text: string;
  /** ms per character. Default 45. */
  speed?: number;
  className?: string;
  /** show a trailing blinking block cursor. Default true. */
  cursor?: boolean;
  as?: ElementType;
}

/** Types its text out once, the moment it scrolls into view. */
export default function Typewriter({
  text,
  speed = 45,
  className,
  cursor = true,
  as: Tag = "span",
}: TypewriterProps) {
  const ref = useRef<HTMLElement | null>(null);
  const mounted = useRef(true);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useScrollAnimation(ref, () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setCount(text.length);
      setDone(true);
      return;
    }
    let i = 0;
    const tick = () => {
      if (!mounted.current) return;
      i += 1;
      setCount(i);
      if (i >= text.length) {
        setDone(true);
        return;
      }
      window.setTimeout(tick, speed);
    };
    tick();
  });

  return (
    <Tag ref={ref} className={className}>
      {text.slice(0, count)}
      {cursor && (
        <span className={done ? "blink" : ""} aria-hidden>
          █
        </span>
      )}
    </Tag>
  );
}
