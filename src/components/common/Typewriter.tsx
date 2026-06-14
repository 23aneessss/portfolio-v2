"use client";

import { useRef, useState, type ElementType } from "react";
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
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useScrollAnimation(ref as React.RefObject<HTMLElement>, () => {
    let i = 0;
    const tick = () => {
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
