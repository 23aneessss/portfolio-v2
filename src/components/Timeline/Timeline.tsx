"use client";

import { useEffect, useRef, useState } from "react";
import type { TimelineEntry, TimelineType } from "@/lib/types";
import { gsap, ScrollTrigger } from "@/hooks/useScrollAnimation";
import Typewriter from "@/components/common/Typewriter";

interface TimelineProps {
  timeline: TimelineEntry[];
}

interface Pt {
  x: number;
  y: number;
} // normalized 0..1

const TYPE_COLOR: Record<TimelineType, string> = {
  EDUCATION: "#3a8ee6",
  COMMUNITY: "#ffb000",
  PROJECT: "#39ff14",
  EVENT: "#ff6b9d",
  ONGOING: "#b06bd6",
};

function layout(n: number, cols = 3): Pt[] {
  const rows = Math.ceil(n / cols);
  const xPad = 0.13;
  const yTop = 0.3;
  const yBot = 0.74;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const visualCol = r % 2 === 1 ? cols - 1 - c : c;
    const x =
      cols === 1 ? 0.5 : xPad + (visualCol / (cols - 1)) * (1 - 2 * xPad);
    const y = rows === 1 ? 0.52 : yTop + (r / (rows - 1)) * (yBot - yTop);
    pts.push({ x, y });
  }
  return pts;
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Timeline({ timeline }: TimelineProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);

  const nodes = layout(timeline.length);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    const section = sectionRef.current;
    if (!canvas || !sticky || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let iw = 0; // internal (low-res) width
    let ih = 0;
    let bg: HTMLCanvasElement | null = null;
    const SCALE = 3;

    // ---- node + path pixel art baked into an offscreen layer ----
    const drawIcon = (
      g: CanvasRenderingContext2D,
      type: TimelineType,
      px: number,
      py: number
    ) => {
      const col = TYPE_COLOR[type];
      // base pad
      g.fillStyle = "#1c2a18";
      g.fillRect(px - 7, py - 3, 14, 7);
      g.fillStyle = "#26331f";
      g.fillRect(px - 7, py - 1, 14, 3);
      const set = (c: string) => (g.fillStyle = c);
      const r = (x: number, y: number, w: number, h: number) =>
        g.fillRect(px + x, py + y, w, h);
      set(col);
      switch (type) {
        case "EDUCATION": // school: building + roof + door
          set("#caa06a");
          r(-5, -10, 10, 8);
          set("#7a3b2a");
          r(-6, -13, 12, 3); // roof
          set("#3a2a1a");
          r(-1, -6, 2, 4); // door
          set(col);
          r(-4, -9, 2, 2);
          r(2, -9, 2, 2);
          break;
        case "COMMUNITY": // flag on pole
          set("#9aa0b0");
          r(-1, -13, 1, 13);
          set(col);
          r(0, -13, 7, 5);
          break;
        case "PROJECT": // floppy/diamond disk
          set("#16161f");
          r(-5, -11, 10, 10);
          set(col);
          r(-3, -11, 6, 3);
          set("#d8d8c8");
          r(-3, -6, 6, 4);
          break;
        case "EVENT": // trophy
          set(col);
          r(-4, -12, 8, 4);
          r(-2, -8, 4, 3); // stem
          set("#caa000");
          r(-3, -5, 6, 2); // base
          break;
        case "ONGOING": // gear/star
          set(col);
          r(-2, -13, 4, 12);
          r(-6, -8, 12, 4);
          r(-4, -11, 8, 8);
          set("#0a0a0f");
          r(-1, -8, 2, 2);
          break;
      }
    };

    const buildBackground = () => {
      const off = document.createElement("canvas");
      off.width = iw;
      off.height = ih;
      const g = off.getContext("2d")!;
      const rnd = mulberry(1337);

      // grass base + texture tiles
      g.fillStyle = "#2f4a22";
      g.fillRect(0, 0, iw, ih);
      const tile = 4;
      for (let y = 0; y < ih; y += tile) {
        for (let x = 0; x < iw; x += tile) {
          const v = rnd();
          if (v > 0.82) g.fillStyle = "#365826";
          else if (v < 0.16) g.fillStyle = "#284018";
          else continue;
          g.fillRect(x, y, tile, tile);
          if (v > 0.96) {
            g.fillStyle = "#4a6b30";
            g.fillRect(x + 1, y + 1, 1, 1);
          }
        }
      }

      // winding path between consecutive nodes
      const px = (p: Pt) => ({ x: p.x * iw, y: p.y * ih });
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = px(nodes[i]);
        const b = px(nodes[i + 1]);
        const steps = Math.max(
          24,
          Math.round(Math.hypot(b.x - a.x, b.y - a.y))
        );
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          // gentle sine wobble perpendicular to the segment
          const wob = Math.sin(t * Math.PI * 3) * 4;
          const nx = -(b.y - a.y);
          const ny = b.x - a.x;
          const len = Math.hypot(nx, ny) || 1;
          const cx = a.x + (b.x - a.x) * t + (nx / len) * wob;
          const cy = a.y + (b.y - a.y) * t + (ny / len) * wob;
          g.fillStyle = "#5a4326";
          g.fillRect(Math.round(cx) - 4, Math.round(cy) - 4, 8, 8);
          g.fillStyle = "#caa063";
          g.fillRect(Math.round(cx) - 2, Math.round(cy) - 2, 4, 4);
        }
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const p = px(nodes[i]);
        drawIcon(g, timeline[i].type, Math.round(p.x), Math.round(p.y));
      }

      bg = off;
    };

    const resize = () => {
      const cssW = sticky.clientWidth;
      const cssH = sticky.clientHeight;
      iw = Math.max(120, Math.floor(cssW / SCALE));
      ih = Math.max(120, Math.floor(cssH / SCALE));
      canvas.width = iw;
      canvas.height = ih;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.imageSmoothingEnabled = false;
      buildBackground();
    };

    // ---- sprite ----
    const drawSprite = (px: number, py: number, frame: number, walk: boolean) => {
      const bob = frame === 1 ? -1 : 0;
      const y = py + bob;
      const b = (dx: number, dy: number, w: number, h: number, c: string) => {
        ctx.fillStyle = c;
        ctx.fillRect(Math.round(px + dx), Math.round(y + dy), w, h);
      };
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(Math.round(px - 3), Math.round(py + 1), 6, 2);
      // head / body / arms
      b(-2, -11, 4, 4, "#e3b48a");
      b(-1, -13, 2, 2, "#2a2a3f"); // hair
      b(-2, -7, 4, 4, "#39ff14"); // shirt
      b(-4, -7, 2, 3, "#39ff14");
      b(2, -7, 2, 3, "#39ff14"); // arms
      // legs (2-frame stride)
      if (walk && frame === 1) {
        b(-3, -3, 2, 3, "#2a2a3f");
        b(1, -3, 2, 3, "#2a2a3f");
      } else {
        b(-2, -3, 2, 3, "#2a2a3f");
        b(0, -3, 2, 3, "#2a2a3f");
      }
      // tiny laptop glow
      b(-1, -6, 3, 1, "#9be7ff");
    };

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let raf = 0;
    let lastActive = -1;
    const start = performance.now();

    const frameLoop = () => {
      const p = progressRef.current;
      const segCount = Math.max(1, nodes.length - 1);
      const span = 1 / segCount;
      let seg = Math.min(segCount - 1, Math.floor(p / span));
      const local = (p - seg * span) / span; // 0..1 within segment
      const travel = 0.66;

      let pos: Pt;
      let walking: boolean;
      let activeIdx: number;
      if (local < travel) {
        const t = easeInOut(local / travel);
        pos = {
          x: nodes[seg].x + (nodes[seg + 1].x - nodes[seg].x) * t,
          y: nodes[seg].y + (nodes[seg + 1].y - nodes[seg].y) * t,
        };
        walking = true;
        activeIdx = seg;
      } else {
        pos = nodes[seg + 1];
        walking = false;
        activeIdx = seg + 1;
      }
      if (p <= 0.0001) {
        pos = nodes[0];
        activeIdx = 0;
        walking = false;
      }

      if (activeIdx !== lastActive) {
        lastActive = activeIdx;
        setActive(activeIdx);
      }

      // render
      if (bg) ctx.drawImage(bg, 0, 0);
      const elapsed = performance.now() - start;
      const frame = Math.floor(elapsed / 250) % 2; // 4fps 2-frame
      drawSprite(pos.x * iw, pos.y * ih, frame, walking && !reduce);

      raf = requestAnimationFrame(frameLoop);
    };

    resize();
    window.addEventListener("resize", resize);

    // ---- scroll → progress ----
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=1800",
        pin: sticky,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => (progressRef.current = self.progress),
      });
      return () => st.kill();
    });
    mm.add("(max-width: 768px)", () => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        end: "bottom 30%",
        scrub: true,
        onUpdate: (self) => (progressRef.current = self.progress),
      });
      return () => st.kill();
    });

    if (reduce) progressRef.current = 1;
    raf = requestAnimationFrame(frameLoop);
    const refreshT = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.clearTimeout(refreshT);
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline.length]);

  return (
    <section id="timeline" ref={sectionRef} className="timeline">
      <div ref={stickyRef} className="timeline__sticky">
        <div className="container timeline__inner">
          <Typewriter
            as="h2"
            className="section-title"
            text="> ADVENTURE_LOG.DAT"
          />

          <div className="timeline__layout">
            <div className="map">
              <canvas ref={canvasRef} aria-hidden />
              {nodes.map((p, i) => (
                <span
                  key={i}
                  className={`map__tag${i === active ? " is-active" : ""}`}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                >
                  {timeline[i].year}
                </span>
              ))}
              <span className="map__legend dim">▲ scroll to walk the path</span>
            </div>

            <ol className="log">
              {timeline.map((entry, i) => (
                <li
                  key={i}
                  className={`log__item${i === active ? " is-active" : ""}`}
                >
                  <span
                    className="log__type"
                    style={{ color: TYPE_COLOR[entry.type] }}
                  >
                    [{entry.type}]
                  </span>
                  <span className="log__year amber">{entry.year}</span>
                  <span className="log__title">{entry.title}</span>
                  <span className="log__desc dim">{entry.description}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timeline {
          position: relative;
        }
        .timeline__sticky {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: var(--space-8) 0;
        }
        .timeline__inner {
          width: 100%;
        }
        .timeline__layout {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: var(--space-4);
          align-items: stretch;
        }
        .map {
          position: relative;
          height: 460px;
          border: 2px solid var(--border);
          overflow: hidden;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.55);
        }
        .map canvas {
          display: block;
          image-rendering: pixelated;
        }
        .map__tag {
          position: absolute;
          transform: translate(-50%, -260%);
          font-size: 0.46rem;
          color: var(--white);
          background: rgba(10, 10, 15, 0.82);
          border: 2px solid var(--border);
          padding: 3px 5px;
          white-space: nowrap;
          pointer-events: none;
        }
        .map__tag.is-active {
          border-color: var(--green);
          color: var(--green);
          box-shadow: 0 0 10px var(--green-dim);
        }
        .map__legend {
          position: absolute;
          left: 8px;
          bottom: 8px;
          font-size: 0.42rem;
          letter-spacing: 1px;
        }
        .log {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 460px;
          overflow: auto;
          padding-right: 6px;
        }
        .log__item {
          display: grid;
          grid-template-columns: auto auto;
          grid-auto-rows: auto;
          gap: 4px 10px;
          padding: 12px;
          border: 2px solid var(--border);
          background: var(--surface);
          opacity: 0.5;
          transition: opacity 0.15s steps(2), border-color 0.15s steps(2),
            transform 0.15s steps(2);
        }
        .log__item.is-active {
          opacity: 1;
          border-color: var(--green);
          box-shadow: 0 0 16px var(--green-dim);
          transform: translateX(4px);
        }
        .log__type {
          font-size: 0.42rem;
        }
        .log__year {
          font-size: 0.42rem;
          text-align: right;
        }
        .log__title {
          grid-column: 1 / -1;
          font-size: 0.55rem;
          color: var(--white);
          line-height: 1.6;
        }
        .log__desc {
          grid-column: 1 / -1;
          font-size: 0.46rem;
          line-height: 1.8;
        }
        @media (max-width: 768px) {
          .timeline__sticky {
            min-height: auto;
          }
          .timeline__layout {
            grid-template-columns: 1fr;
          }
          .map {
            height: 320px;
          }
          .log {
            max-height: none;
          }
        }
      `}</style>
    </section>
  );
}
