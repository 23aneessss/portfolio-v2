"use client";

import { useEffect, useRef } from "react";

/**
 * Full-viewport scanline canvas painted on top of everything.
 * - horizontal dark lines every 3px at ~15% opacity
 * - the whole field drifts downward 0.5px/frame and loops (the "living" effect)
 * - honors prefers-reduced-motion by drawing a single static pass
 */
export default function CRTOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const LINE_GAP = 3; // px between scanlines
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let drift = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // scanlines
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      const start = (drift % LINE_GAP) - LINE_GAP;
      for (let y = start; y < height; y += LINE_GAP) {
        ctx.fillRect(0, y, width, 1);
      }

      // faint moving "phosphor refresh" band for extra life
      const bandY = (drift * 6) % (height + 200) - 100;
      const grad = ctx.createLinearGradient(0, bandY, 0, bandY + 90);
      grad.addColorStop(0, "rgba(57, 255, 20, 0)");
      grad.addColorStop(0.5, "rgba(57, 255, 20, 0.035)");
      grad.addColorStop(1, "rgba(57, 255, 20, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, bandY, width, 90);
    };

    const loop = () => {
      drift += 0.5; // 0.5px / frame downward drift
      if (drift > 1e6) drift = 0;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
