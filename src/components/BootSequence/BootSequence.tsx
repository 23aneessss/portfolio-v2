"use client";

import { useEffect, useRef, useState } from "react";

interface BootSequenceProps {
  handle: string;
}

type Phase = "flicker" | "typing" | "dissolve" | "done";

/**
 * Full-screen black terminal that plays once on first client mount:
 *   1. CRT warm-up — flash white → black twice
 *   2. type the BIOS lines character-by-character (40ms/char) with a blinking █ cursor
 *   3. pixel-dissolve the screen away top-to-bottom to reveal the site beneath
 *
 * Honors prefers-reduced-motion by skipping straight to the site.
 */
export default function BootSequence({ handle }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>("flicker");
  const [typed, setTyped] = useState("");
  const [flash, setFlash] = useState<"black" | "white">("black");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // full script — final line is built from the handle so it stays data-driven
  const lines = [
    "RETRO-OS v1.987 — BIOS v2.4.1",
    "Initializing memory... [████████████████] 640KB OK",
    "Loading pixel engine...",
    "Mounting filesystem...",
    "> PORTFOLIO.EXE found",
    `> Launching ${handle}...`,
  ];
  const script = lines.join("\n");

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setPhase("done");
      return;
    }

    // lock scroll while the terminal owns the screen
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timers: number[] = [];
    let dissolveRaf = 0;
    const at = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));

    // ---- phase 1: CRT warm-up flicker (white/black twice) ----
    at(() => setFlash("white"), 80);
    at(() => setFlash("black"), 150);
    at(() => setFlash("white"), 230);
    at(() => setFlash("black"), 300);

    // ---- phase 2: typing ----
    at(() => {
      setPhase("typing");
      let i = 0;
      const typeNext = () => {
        i += 1;
        setTyped(script.slice(0, i));
        if (i >= script.length) {
          at(() => startDissolve(), 550);
          return;
        }
        // newlines pause a touch longer, like a real boot ROM
        const delay = script[i - 1] === "\n" ? 170 : 40;
        timers.push(window.setTimeout(typeNext, delay));
      };
      typeNext();
    }, 360);

    // ---- phase 3: pixel dissolve ----
    const startDissolve = () => {
      setPhase("dissolve");
      // hide the text instantly; the canvas will paint a seamless black field
      if (preRef.current) preRef.current.style.opacity = "0";
      if (rootRef.current) rootRef.current.style.background = "transparent";

      const canvas = canvasRef.current;
      if (!canvas) return finish();
      const ctx = canvas.getContext("2d");
      if (!ctx) return finish();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas.style.display = "block";

      // seamless: repaint the exact boot background so nothing flickers
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, w, h);

      const cell = 8; // 8px pixel blocks
      const cols = Math.ceil(w / cell);
      const front = new Float32Array(cols); // cleared down-to-y per column
      const delay = new Float32Array(cols); // per-column head start (cascade)
      for (let c = 0; c < cols; c++) delay[c] = Math.random() * 10;

      const base = Math.max(14, h / 36); // px cleared per frame
      let frame = 0;

      const step = () => {
        frame += 1;
        let done = true;
        for (let c = 0; c < cols; c++) {
          if (frame < delay[c]) {
            done = false;
            continue;
          }
          if (front[c] < h) {
            done = false;
            const adv = base + Math.random() * base * 0.8;
            const y0 = front[c];
            const next = y0 + adv;
            ctx.clearRect(c * cell, y0, cell, next - y0 + 1);
            front[c] = next;
          }
        }
        if (done) {
          finish();
          return;
        }
        dissolveRaf = requestAnimationFrame(step);
      };
      dissolveRaf = requestAnimationFrame(step);
    };

    const finish = () => {
      document.body.style.overflow = prevOverflow;
      setPhase("done");
      window.dispatchEvent(new CustomEvent("boot:complete"));
    };

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(dissolveRaf);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: flash === "white" ? "#e8e8e8" : "#0a0a0f",
        overflow: "hidden",
      }}
    >
      <pre
        ref={preRef}
        style={{
          position: "absolute",
          top: "12%",
          left: "max(24px, 6vw)",
          right: "24px",
          margin: 0,
          color: "var(--green)",
          fontFamily: "var(--font-pixel), 'Courier New', monospace",
          fontSize: "clamp(0.55rem, 1.6vw, 0.85rem)",
          lineHeight: 2.1,
          textShadow: "0 0 8px var(--green-soft)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {typed}
        {phase === "typing" && <span className="blink">█</span>}
      </pre>

      {/* dissolve target — hidden until the wipe begins */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "none",
        }}
      />
    </div>
  );
}
