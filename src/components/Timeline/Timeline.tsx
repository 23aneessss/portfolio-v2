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
  WORK: "#ffb000",
  COMMUNITY: "#ffb000",
  PROJECT: "#39ff14",
  EVENT: "#ff6b9d",
  ONGOING: "#b06bd6",
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const shortYear = (year: string) => (year.match(/\d{4}/)?.[0] ?? year);

export default function Timeline({ timeline }: TimelineProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logRef = useRef<HTMLOListElement | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);

  // node positions: a vertical winding path, top → bottom
  const nodes: Pt[] = timeline.map((_, i) => {
    const n = timeline.length;
    const y = n > 1 ? 0.22 + (i / (n - 1)) * 0.7 : 0.5;
    const x = 0.5 + 0.2 * Math.sin(i * 1.15 + 0.4);
    return { x, y };
  });
  const house: Pt = { x: 0.5, y: 0.07 };
  const waypoints: Pt[] = [house, ...nodes];

  useEffect(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    const section = sectionRef.current;
    const map = mapRef.current;
    if (!canvas || !sticky || !section || !map) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let iw = 0;
    let ih = 0;
    let bg: HTMLCanvasElement | null = null;
    const SCALE = 3;

    const set = (g: CanvasRenderingContext2D, c: string) =>
      (g.fillStyle = c);

    const drawHouse = (g: CanvasRenderingContext2D, px: number, py: number) => {
      const r = (x: number, y: number, w: number, h: number) =>
        g.fillRect(px + x, py + y, w, h);
      // shadow
      set(g, "rgba(0,0,0,0.3)");
      r(-9, 1, 18, 3);
      // roof (stepped triangle)
      set(g, "#b5482e");
      for (let i = 0; i < 6; i++) r(-8 + i, -16 + i, 16 - i * 2, 1);
      // chimney
      set(g, "#7a3b2a");
      r(4, -18, 3, 5);
      // body
      set(g, "#caa06a");
      r(-7, -10, 14, 10);
      // door
      set(g, "#5a3a1f");
      r(-2, -6, 4, 6);
      set(g, "#ffd24a");
      r(1, -3, 1, 1); // door knob
      // window
      set(g, "#9be7ff");
      r(-5, -8, 3, 3);
      r(3, -8, 3, 3);
      set(g, "#5a3a1f");
      r(-4, -8, 1, 3);
      r(4, -8, 1, 3);
    };

    const drawIcon = (
      g: CanvasRenderingContext2D,
      type: TimelineType,
      px: number,
      py: number
    ) => {
      const col = TYPE_COLOR[type];
      const r = (x: number, y: number, w: number, h: number) =>
        g.fillRect(px + x, py + y, w, h);
      // base pad
      set(g, "#1c2a18");
      r(-8, -2, 16, 6);
      set(g, "#26331f");
      r(-8, 0, 16, 3);
      switch (type) {
        case "EDUCATION": // school building
          set(g, "#caa06a");
          r(-6, -11, 12, 9);
          set(g, "#7a3b2a");
          for (let i = 0; i < 4; i++) r(-7 + i, -15 + i, 14 - i * 2, 1);
          set(g, "#3a2a1a");
          r(-1, -7, 2, 5); // door
          set(g, "#9be7ff");
          r(-5, -10, 3, 3);
          r(2, -10, 3, 3); // windows
          set(g, col);
          r(-7, -2, 14, 1); // accent line
          break;
        case "WORK": // briefcase
          set(g, "#8a5a2a");
          r(-7, -9, 14, 9);
          set(g, "#6a4420");
          r(-7, -5, 14, 1);
          set(g, "#caa06a");
          r(-3, -12, 6, 3); // handle
          set(g, "#3a2a1a");
          r(-3, -12, 6, 1);
          set(g, col);
          r(-1, -6, 2, 3); // latch
          break;
        case "EVENT": // trophy
          set(g, col);
          r(-4, -12, 8, 4);
          r(-2, -8, 4, 3);
          set(g, "#caa000");
          r(-3, -5, 6, 2);
          break;
        case "PROJECT": // disk
          set(g, "#16161f");
          r(-5, -11, 10, 10);
          set(g, col);
          r(-3, -11, 6, 3);
          set(g, "#d8d8c8");
          r(-3, -6, 6, 4);
          break;
        default: // flag (community / ongoing)
          set(g, "#9aa0b0");
          r(-1, -13, 1, 13);
          set(g, col);
          r(0, -13, 7, 5);
          break;
      }
    };

    const px = (p: Pt) => ({ x: p.x * iw, y: p.y * ih });

    const buildBackground = () => {
      const off = document.createElement("canvas");
      off.width = iw;
      off.height = ih;
      const g = off.getContext("2d")!;
      const rnd = mulberry(2024);

      // grass
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
          if (v > 0.965) {
            g.fillStyle = "#4a6b30";
            g.fillRect(x + 1, y + 1, 1, 1);
          }
        }
      }

      // winding path through all waypoints
      for (let i = 0; i < waypoints.length - 1; i++) {
        const a = px(waypoints[i]);
        const b = px(waypoints[i + 1]);
        const steps = Math.max(20, Math.round(Math.hypot(b.x - a.x, b.y - a.y)));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const wob = Math.sin(t * Math.PI * 2) * 3;
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

      // house at the top
      const h = px(house);
      drawHouse(g, Math.round(h.x), Math.round(h.y));

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const p = px(nodes[i]);
        drawIcon(g, timeline[i].type, Math.round(p.x), Math.round(p.y));
      }

      bg = off;
    };

    const resize = () => {
      const cssW = map.clientWidth;
      const cssH = map.clientHeight;
      iw = Math.max(120, Math.floor(cssW / SCALE));
      ih = Math.max(160, Math.floor(cssH / SCALE));
      canvas.width = iw;
      canvas.height = ih;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.imageSmoothingEnabled = false;
      buildBackground();
    };

    const drawSprite = (
      cxp: number,
      cyp: number,
      frame: number,
      walk: boolean
    ) => {
      const bob = frame === 1 ? -1 : 0;
      const y = cyp + bob;
      const b = (dx: number, dy: number, w: number, h: number, c: string) => {
        ctx.fillStyle = c;
        ctx.fillRect(Math.round(cxp + dx), Math.round(y + dy), w, h);
      };
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(Math.round(cxp - 3), Math.round(cyp + 1), 6, 2);
      b(-2, -11, 4, 4, "#e3b48a"); // head
      b(-2, -13, 4, 2, "#2a2a3f"); // hair
      b(-2, -7, 4, 4, "#39ff14"); // shirt
      b(-4, -7, 2, 3, "#39ff14");
      b(2, -7, 2, 3, "#39ff14"); // arms
      if (walk && frame === 1) {
        b(-3, -3, 2, 3, "#2a2a3f");
        b(1, -3, 2, 3, "#2a2a3f");
      } else {
        b(-2, -3, 2, 3, "#2a2a3f");
        b(0, -3, 2, 3, "#2a2a3f");
      }
      b(-1, -6, 3, 1, "#9be7ff"); // laptop glow
    };

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let raf = 0;
    let lastActive = -1;
    const start = performance.now();

    const frameLoop = () => {
      const p = progressRef.current;
      const segCount = Math.max(1, waypoints.length - 1);
      const span = 1 / segCount;
      const seg = Math.min(segCount - 1, Math.max(0, Math.floor(p / span)));
      const local = (p - seg * span) / span;
      const travel = 0.6;

      let pos: Pt;
      let walking: boolean;
      if (local < travel) {
        const t = easeInOut(local / travel);
        pos = {
          x: waypoints[seg].x + (waypoints[seg + 1].x - waypoints[seg].x) * t,
          y: waypoints[seg].y + (waypoints[seg + 1].y - waypoints[seg].y) * t,
        };
        walking = true;
      } else {
        pos = waypoints[seg + 1];
        walking = false;
      }
      const activeIdx = Math.min(nodes.length - 1, seg); // node index

      if (activeIdx !== lastActive) {
        lastActive = activeIdx;
        setActive(activeIdx);
      }

      if (bg) ctx.drawImage(bg, 0, 0);
      const elapsed = performance.now() - start;
      const frame = Math.floor(elapsed / 250) % 2;
      drawSprite(pos.x * iw, pos.y * ih, frame, walking && !reduce);

      raf = requestAnimationFrame(frameLoop);
    };

    resize();
    window.addEventListener("resize", resize);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=2400",
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
        start: "top 75%",
        end: "bottom 40%",
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

  // keep the active card centered in the log rail as the character descends
  useEffect(() => {
    const container = logRef.current;
    const item = itemRefs.current[active];
    if (!container || !item) return;
    const target =
      item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;
    container.scrollTo({ top: target, behavior: "smooth" });
  }, [active]);

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
            <div ref={mapRef} className="map">
              <canvas ref={canvasRef} aria-hidden />
              {nodes.map((p, i) => (
                <span
                  key={i}
                  className={`map__tag${i === active ? " is-active" : ""}`}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                >
                  {shortYear(timeline[i].year)}
                </span>
              ))}
              <span className="map__legend dim">▼ scroll to walk the path</span>
            </div>

            <ol ref={logRef} className="log">
              {timeline.map((entry, i) => (
                <li
                  key={i}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={`log__item${i === active ? " is-active" : ""}`}
                >
                  <div className="log__top">
                    <span
                      className="log__type"
                      style={{ color: TYPE_COLOR[entry.type] }}
                    >
                      [{entry.type}]
                    </span>
                    <span className="log__year amber">{entry.year}</span>
                  </div>
                  <span className="log__title">{entry.title}</span>
                  {entry.org && <span className="log__org dim">{entry.org}</span>}
                  {i === active && (
                    <span className="log__desc">{entry.description}</span>
                  )}
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
          grid-template-columns: 320px 1fr;
          gap: var(--space-4);
          align-items: stretch;
        }
        .map {
          position: relative;
          height: 70vh;
          min-height: 480px;
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
          transform: translate(-50%, -50%) translateX(34px);
          font-size: 0.44rem;
          color: var(--white);
          background: rgba(10, 10, 15, 0.85);
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
          gap: 12px;
          max-height: 70vh;
          min-height: 480px;
          overflow: hidden;
          padding-right: 4px;
        }
        .log__item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 14px 16px;
          border: 2px solid var(--border);
          background: var(--surface);
          opacity: 0.45;
          transition: opacity 0.18s steps(3), border-color 0.18s steps(3),
            transform 0.18s steps(3), box-shadow 0.18s steps(3);
        }
        .log__item.is-active {
          opacity: 1;
          border-color: var(--green);
          box-shadow: 0 0 18px var(--green-dim);
          transform: translateX(6px);
        }
        .log__top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }
        .log__type {
          font-size: 0.44rem;
          letter-spacing: 1px;
        }
        .log__year {
          font-size: 0.44rem;
        }
        .log__title {
          font-size: 0.7rem;
          color: var(--white);
          line-height: 1.5;
        }
        .log__org {
          font-size: 0.46rem;
          line-height: 1.7;
          letter-spacing: 0.5px;
        }
        .log__desc {
          font-size: 0.5rem;
          line-height: 2;
          color: var(--white);
          border-left: 2px solid var(--green);
          padding-left: 12px;
          margin-top: 4px;
        }
        @media (max-width: 768px) {
          .timeline__sticky {
            min-height: auto;
          }
          .timeline__layout {
            grid-template-columns: 1fr;
            gap: var(--space-3);
          }
          .map {
            height: 360px;
            min-height: 0;
          }
          .log {
            max-height: none;
            min-height: 0;
            overflow: visible;
          }
        }
      `}</style>
    </section>
  );
}
