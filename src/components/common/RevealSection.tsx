"use client";

import { useRef } from "react";
import { gsap, useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Wraps a section and plays a "floppy disk wipe" when it scrolls into view:
 * a dark bar slides across left→right, pauses, then slides off to reveal the
 * section. Used for standard-height sections (not the pinned ones).
 */
export default function RevealSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useScrollAnimation(
    ref,
    () => {
      const bar = barRef.current;
      if (!bar) return;
      gsap
        .timeline()
        .set(bar, { xPercent: -101, display: "block" })
        .to(bar, { xPercent: 0, duration: 0.18, ease: "steps(6)" })
        .to(bar, { xPercent: 101, duration: 0.24, ease: "steps(8)", delay: 0.1 })
        .set(bar, { display: "none" });
    },
    { start: "top 82%" }
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {children}
      <div ref={barRef} className="wipe-bar" aria-hidden>
        <span className="wipe-bar__edge" />
        <style jsx>{`
          .wipe-bar {
            position: absolute;
            inset: 0;
            z-index: 40;
            display: none;
            background: var(--bg);
            pointer-events: none;
            border-right: 4px solid var(--green);
            box-shadow: 0 0 30px var(--green-dim);
            transform: translateX(-101%);
          }
          .wipe-bar__edge {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 22px;
            background: repeating-linear-gradient(
              0deg,
              var(--green) 0,
              var(--green) 6px,
              transparent 6px,
              transparent 12px
            );
            opacity: 0.5;
          }
        `}</style>
      </div>
    </div>
  );
}
