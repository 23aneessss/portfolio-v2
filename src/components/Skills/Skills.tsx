"use client";

import { useEffect, useRef, useState } from "react";
import type { Skill, Skills as SkillsData, SkillCategory } from "@/lib/types";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { techColor } from "@/lib/colors";
import Typewriter from "@/components/common/Typewriter";

interface SkillsProps {
  skills: SkillsData;
}

const TABS: { key: SkillCategory; label: string }[] = [
  { key: "languages", label: "LANGUAGES" },
  { key: "frameworks", label: "FRAMEWORKS" },
  { key: "tools", label: "TOOLS" },
];

/** 16×16 canvas emblem (pixel-art letter mark) for a tech slot. */
function PixelIcon({ name }: { name: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const color = techColor(name);
  const glyph = name.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "?";

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 16, 16);
    // colored frame
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 16);
    // inner well
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(2, 2, 12, 12);
    // pixel corner accents
    ctx.fillStyle = color;
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(12, 12, 2, 2);
    // glyph
    ctx.fillStyle = color;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, 8, 9);
  }, [color, glyph]);

  return (
    <canvas
      ref={ref}
      width={16}
      height={16}
      aria-hidden
      style={{ width: 40, height: 40, imageRendering: "pixelated" }}
    />
  );
}

function SkillSlot({ skill, revealed }: { skill: Skill; revealed: boolean }) {
  return (
    <div className="slot">
      <PixelIcon name={skill.name} />
      <span className="slot__name">{skill.name}</span>
      <span className="bar slot__bar" aria-hidden>
        <span
          className="bar__fill"
          style={{ width: revealed ? `${skill.value}%` : "0%" }}
        />
      </span>
      <span className="slot__pct green">{skill.value}%</span>
      <style jsx>{`
        .slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 10px;
          border: 2px solid var(--border);
          background: var(--surface);
          text-align: center;
          transition: border-color 0.12s steps(2), box-shadow 0.12s steps(2);
        }
        .slot:hover {
          border-color: var(--green);
          box-shadow: 0 0 16px var(--green-dim);
        }
        .slot__name {
          font-size: 0.46rem;
          line-height: 1.5;
          color: var(--white);
          min-height: 2.2em;
          display: flex;
          align-items: center;
        }
        .slot__bar {
          width: 100%;
          height: 8px;
        }
        .slot__pct {
          font-size: 0.44rem;
        }
      `}</style>
    </div>
  );
}

export default function Skills({ skills }: SkillsProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [tab, setTab] = useState<SkillCategory>("languages");
  const [revealed, setRevealed] = useState(false);

  useScrollAnimation(ref, () => setRevealed(true));

  const items = skills[tab];

  return (
    <section id="skills" ref={ref} className="section skills">
      <div className="container">
        <Typewriter
          as="h2"
          className="section-title"
          text="> INVENTORY.SYS — EQUIPPED SKILLS"
        />

        <div className="inv">
          <div className="inv__tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={`inv__tab${tab === t.key ? " is-active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                [ {t.label} ]
              </button>
            ))}
          </div>

          <div className="inv__grid">
            {items.map((s) => (
              <SkillSlot key={s.name} skill={s} revealed={revealed} />
            ))}
          </div>

          <div className="inv__foot dim">
            {">"} {items.length} ITEMS EQUIPPED · CATEGORY: {tab.toUpperCase()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .inv {
          border: 2px solid var(--border);
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(52, 224, 161, 0.04),
              transparent 60%
            ),
            var(--surface);
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5);
        }
        .inv__tabs {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 2px solid var(--border);
        }
        .inv__tab {
          flex: 1;
          min-width: 120px;
          padding: 14px 10px;
          font-size: 0.55rem;
          letter-spacing: 1px;
          color: var(--dim);
          border-right: 2px solid var(--border);
          /* tab switching is instant — no transition */
        }
        .inv__tab:last-child {
          border-right: none;
        }
        .inv__tab.is-active {
          background: var(--green);
          color: var(--bg);
          text-shadow: none;
        }
        .inv__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
          gap: 12px;
          padding: var(--space-3);
        }
        .inv__foot {
          padding: 12px var(--space-3);
          border-top: 2px solid var(--border);
          font-size: 0.48rem;
          letter-spacing: 1px;
        }
        @media (max-width: 768px) {
          .inv__grid {
            grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
          }
          .inv__tab {
            min-width: 0;
            font-size: 0.48rem;
          }
        }
      `}</style>
    </section>
  );
}
