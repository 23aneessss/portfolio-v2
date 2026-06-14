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
  const [typed, setTyped] = useState<string[]>(personal.bio.map(() => ""));

  // derive RPG card fields from data
  const role = personal.title.split(",").slice(1).join(",").trim() || personal.title;
  const charClass = role.replace(" Developer", " Dev");

  // animate stat bars when the card enters view
  useScrollAnimation(cardRef as React.RefObject<HTMLElement>, () =>
    setRevealed(true)
  );

  // type the bio line by line when it enters view
  useScrollAnimation(bioRef as React.RefObject<HTMLElement>, () => {
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

            <div className="rpg-card__meta">
              <div>
                <span className="dim">NAME</span>
                <span className="green">{personal.handle}</span>
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

          {/* ---- bio ---- */}
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
        </div>
      </div>

      <style jsx>{`
        .about__grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: var(--space-6);
          align-items: start;
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
        @media (max-width: 768px) {
          .about__grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
          .rpg-card__stats li {
            grid-template-columns: 80px 1fr 26px;
          }
        }
      `}</style>
    </section>
  );
}
