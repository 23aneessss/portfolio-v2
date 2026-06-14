"use client";

import { useRef, useState } from "react";
import type { Personal, Stat } from "@/lib/types";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Typewriter from "@/components/common/Typewriter";

interface AboutProps {
  personal: Personal;
  stats: Stat[];
}

export default function About({ personal, stats }: AboutProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const bioRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [avatarOk, setAvatarOk] = useState(true);
  const [typed, setTyped] = useState<string[]>(personal.bio.map(() => ""));

  // derive RPG card fields from data
  const role = personal.title.split(",").slice(1).join(",").trim() || personal.title;
  const charClass = role.replace(" Developer", " Dev");
  const githubHandle = personal.github.replace(/^https?:\/\//, "");

  // quick-reference readout shown under the bio
  const specs: [string, string][] = [
    ["ROLE", role],
    ["LOCATION", personal.location],
    ["SCHOOL", personal.school],
    ["LEVEL", personal.year],
    ["FOCUS", "Web · Mobile · Backend"],
    ["GITHUB", githubHandle],
  ];

  // animate stat bars when the card enters view
  useScrollAnimation(cardRef, () => setRevealed(true));

  // type the bio line by line when it enters view
  useScrollAnimation(bioRef, () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(personal.bio);
      return;
    }
    let li = 0;
    const typeLine = () => {
      const full = personal.bio[li];
      let ci = 0;
      const ch = () => {
        ci += 1;
        setTyped((prev) => {
          const copy = [...prev];
          copy[li] = full.slice(0, ci);
          return copy;
        });
        if (ci < full.length) {
          window.setTimeout(ch, 11);
        } else {
          li += 1;
          if (li < personal.bio.length) window.setTimeout(typeLine, 120);
        }
      };
      ch();
    };
    typeLine();
  });

  return (
    <section id="about" className="section about">
      <div className="container">
        <Typewriter
          as="h2"
          className="section-title"
          text="> ABOUT_ME.TXT"
        />

        <div className="about__grid">
          {/* ---- RPG character card ---- */}
          <div ref={cardRef} className="rpg-card bracket-frame">
            <div className="rpg-card__titlebar">CHARACTER SHEET</div>

            {personal.avatar && avatarOk ? (
              <div className="rpg-card__portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={personal.avatar}
                  alt={personal.name}
                  onError={() => setAvatarOk(false)}
                />
                <span className="rpg-card__scan" aria-hidden />
                <span className="rpg-card__pname">{personal.name}</span>
              </div>
            ) : (
              <div className="rpg-card__portrait rpg-card__portrait--empty">
                <span className="dim">◢ NO SIGNAL ◣</span>
              </div>
            )}

            <div className="rpg-card__meta">
              <div>
                <span className="dim">NAME</span>
                <span className="green">{personal.brand}</span>
              </div>
              <div>
                <span className="dim">CLASS</span>
                <span className="green">{charClass}</span>
              </div>
              <div>
                <span className="dim">LEVEL</span>
                <span className="amber">
                  {personal.year} / {personal.school}
                </span>
              </div>
            </div>

            <div className="rpg-card__divider" />

            <ul className="rpg-card__stats">
              {stats.map((s) => (
                <li key={s.label}>
                  <span className="rpg-stat__label">{s.label}</span>
                  <span className="bar" aria-hidden>
                    <span
                      className="bar__fill"
                      style={{ width: revealed ? `${s.value}%` : "0%" }}
                    />
                  </span>
                  <span className="rpg-stat__value green">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- bio + system specs ---- */}
          <div className="about__right">
            <div ref={bioRef} className="about__bio">
              {personal.bio.map((line, i) => (
                <p key={i} className="about__bioline">
                  <span className="green">{">"}</span> {typed[i]}
                  {typed[i] && typed[i].length < line.length && (
                    <span className="blink">█</span>
                  )}
                </p>
              ))}
            </div>

            <div className="about__specs">
              <div className="about__specs-bar">{">"} SYSTEM_SPECS.CFG</div>
              <ul className="about__specs-list">
                {specs.map(([k, v]) => (
                  <li key={k}>
                    <span className="dim">{k}</span>
                    <span className="about__specs-val">{v}</span>
                  </li>
                ))}
                <li>
                  <span className="dim">STATUS</span>
                  <span className="green">
                    <span
                      className="led-dot led-dot--pulse"
                      style={{ width: 8, height: 8, marginRight: 7, verticalAlign: "middle" }}
                      aria-hidden
                    />
                    OPEN TO OPPORTUNITIES
                  </span>
                </li>
              </ul>
              <div className="about__specs-prompt green">
                {">"} READY_<span className="blink">█</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about__grid {
          display: grid;
          grid-template-columns: minmax(0, 360px) 1fr;
          gap: var(--space-6);
          align-items: stretch;
        }
        .rpg-card {
          background: var(--surface);
          border: 2px solid var(--green);
          box-shadow:
            0 0 0 2px var(--bg),
            0 0 24px var(--green-dim),
            inset 0 0 24px rgba(0, 0, 0, 0.5);
          padding: 0;
        }
        .rpg-card__titlebar {
          background: var(--green);
          color: var(--bg);
          font-size: 0.6rem;
          letter-spacing: 2px;
          padding: 8px 12px;
          text-align: center;
        }
        .rpg-card__portrait {
          position: relative;
          width: 100%;
          height: clamp(300px, 30vw, 360px);
          border-bottom: 2px solid var(--border);
          overflow: hidden;
          background: var(--bg);
        }
        .rpg-card__portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: contrast(1.05) saturate(0.92) brightness(1.02);
        }
        .rpg-card__scan {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.16) 0,
            rgba(0, 0, 0, 0.16) 1px,
            transparent 1px,
            transparent 3px
          );
          box-shadow: inset 0 0 50px rgba(52, 224, 161, 0.14);
        }
        .rpg-card__pname {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 6px 8px;
          font-size: 0.46rem;
          color: var(--green);
          background: linear-gradient(
            0deg,
            rgba(10, 10, 15, 0.92),
            transparent
          );
          text-shadow: 0 0 6px var(--green-soft);
        }
        .rpg-card__portrait--empty {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.55rem;
          color: var(--dim);
          background: repeating-linear-gradient(
            45deg,
            var(--surface) 0,
            var(--surface) 8px,
            var(--surface-2) 8px,
            var(--surface-2) 16px
          );
        }
        .rpg-card__meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: var(--space-3);
          font-size: 0.58rem;
        }
        .rpg-card__meta > div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .rpg-card__meta > div > span:last-child {
          text-align: right;
        }
        .rpg-card__divider {
          height: 2px;
          margin: 0 var(--space-3);
          background: repeating-linear-gradient(
            90deg,
            var(--border) 0,
            var(--border) 6px,
            transparent 6px,
            transparent 12px
          );
        }
        .rpg-card__stats {
          list-style: none;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rpg-card__stats li {
          display: grid;
          grid-template-columns: 92px 1fr 28px;
          align-items: center;
          gap: 10px;
        }
        .rpg-stat__label {
          font-size: 0.5rem;
          color: var(--white);
        }
        .rpg-stat__value {
          font-size: 0.5rem;
          text-align: right;
        }
        .about__right {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          min-width: 0;
        }
        .about__bio {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding-top: var(--space-1);
        }
        .about__bioline {
          font-size: 0.62rem;
          line-height: 2.1;
          color: var(--white);
          min-height: 1.2em;
        }
        .about__specs {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 2px solid var(--border);
          background:
            radial-gradient(
              ellipse at 50% 0%,
              rgba(52, 224, 161, 0.05),
              transparent 60%
            ),
            var(--surface);
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
        }
        .about__specs-bar {
          background: var(--border);
          color: var(--green);
          font-size: 0.5rem;
          letter-spacing: 1px;
          padding: 8px 12px;
          border-bottom: 2px solid var(--border);
        }
        .about__specs-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: var(--space-3);
          font-size: 0.52rem;
        }
        .about__specs-list li {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: baseline;
        }
        .about__specs-list li > span:first-child {
          color: var(--dim);
          white-space: nowrap;
        }
        .about__specs-val {
          color: var(--white);
          text-align: right;
          word-break: break-word;
        }
        .about__specs-prompt {
          margin-top: auto;
          padding: 12px var(--space-3);
          border-top: 2px solid var(--border);
          font-size: 0.5rem;
        }
        @media (max-width: 768px) {
          .about__grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          .rpg-card__portrait {
            height: clamp(320px, 80vw, 460px);
          }
          .rpg-card__stats li {
            grid-template-columns: 80px 1fr 26px;
          }
        }
      `}</style>
    </section>
  );
}
