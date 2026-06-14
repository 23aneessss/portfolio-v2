"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import type { Personal } from "@/lib/types";

// Three.js needs `window`; never SSR it.
const PixelRoom = dynamic(() => import("./PixelRoom"), {
  ssr: false,
  loading: () => <div className="room-skeleton" aria-hidden />,
});

interface HeroProps {
  personal: Personal;
}

// presentational display headline (not content data)
const HEADLINE: string[][] = [
  ["CRAFTING", "SYSTEMS"],
  ["&", "USEFUL", "PRODUCTS."],
];

export default function Hero({ personal }: HeroProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // build the muted subtitle from data: "<role> @ <school> · <rest>"
  const [role, ...rest] = personal.title.split(",").map((s) => s.trim());
  const subtitle = `${role} @ ${personal.school} · ${rest.join(" · ")}`;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = headingRef.current;
    if (!root) return;
    const words = root.querySelectorAll<HTMLElement>(".hero-word");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      gsap.set(words, { yPercent: 0 });
      return;
    }

    gsap.set(words, { yPercent: -120 });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(words, {
        yPercent: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.06,
      });
    };
    window.addEventListener("boot:complete", play, { once: true });
    const fallback = window.setTimeout(play, 2500);
    return () => {
      window.removeEventListener("boot:complete", play);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="container hero__grid">
        {/* ---- left: text ---- */}
        <div className="hero__text">
          <p className="hero__eyebrow">
            <span className="led-dot led-dot--pulse" aria-hidden />
            [ PLAYER_001 ONLINE ]
          </p>

          <h1 ref={headingRef} className="hero__heading">
            {HEADLINE.map((line, li) => (
              <span className="hero__line" key={li}>
                {line.map((word, wi) => (
                  <span className="hero__word-wrap" key={wi}>
                    <span className="hero-word">{word}</span>
                    {wi < line.length - 1 ? " " : ""}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="hero__subtitle dim">{subtitle}</p>

          <div className="hero__cta">
            <a className="pixel-btn" href="#projects">
              [ EXPLORE WORK ]
            </a>
            <a className="pixel-btn pixel-btn--amber" href="#contact">
              [ SEND MESSAGE ]
            </a>
          </div>
        </div>

        {/* ---- right: 3D room (desktop) / CSS illustration (mobile) ---- */}
        <div className="hero__room">
          {isMobile ? <PixelRoomFallback /> : <PixelRoom />}
        </div>
      </div>

      <div className="hero__scrollcue dim" aria-hidden>
        ▼ SCROLL TO BOOT WORLD
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: min(88vh, 760px);
          display: flex;
          align-items: center;
          padding: calc(var(--nav-h) + var(--space-2)) 0 var(--space-6);
          overflow: hidden;
        }
        .hero__grid {
          display: grid;
          grid-template-columns: 60% 40%;
          align-items: center;
          gap: var(--space-4);
        }
        .hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--amber);
          font-size: 0.6rem;
          letter-spacing: 2px;
          text-shadow: 0 0 6px var(--amber-soft);
          margin-bottom: var(--space-3);
        }
        .hero__heading {
          font-size: clamp(1.5rem, 4.6vw, 3.1rem);
          line-height: 1.25;
          color: var(--white);
          margin-bottom: var(--space-3);
        }
        .hero__line {
          display: block;
          overflow: hidden;
          padding: 2px 0;
        }
        .hero__word-wrap {
          display: inline-block;
          overflow: hidden;
        }
        .hero-word {
          display: inline-block;
          text-shadow: 2px 2px 0 var(--green);
          will-change: transform;
        }
        .hero__subtitle {
          font-size: 0.62rem;
          line-height: 2;
          max-width: 52ch;
          margin-bottom: var(--space-4);
        }
        .hero__cta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .hero__room {
          position: relative;
          height: 480px;
          border: 2px solid var(--border);
          background:
            radial-gradient(
              ellipse at 50% 40%,
              rgba(52, 224, 161, 0.06),
              transparent 70%
            ),
            var(--surface);
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.6);
        }
        .hero__scrollcue {
          position: absolute;
          bottom: 18px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.5rem;
          letter-spacing: 2px;
          animation: float-bob 2.2s steps(6) infinite;
        }
        @media (max-width: 768px) {
          .hero__grid {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }
          .hero__room {
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
}

/** Flat CSS pixel-art workstation shown instead of WebGL on small screens. */
function PixelRoomFallback() {
  return (
    <div className="fallback" aria-hidden>
      <div className="monitor">
        <div className="screen">
          <span className="line" />
          <span className="line short" />
          <span className="line" />
          <span className="cur blink" />
        </div>
        <div className="stand" />
        <div className="base" />
      </div>
      <div className="floppy" />
      <style jsx>{`
        .fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .monitor {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .screen {
          width: 150px;
          height: 110px;
          background: #06140a;
          border: 4px solid var(--border);
          box-shadow: 0 0 24px var(--green-soft);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .line {
          height: 6px;
          width: 100%;
          background: var(--green);
          box-shadow: 0 0 6px var(--green-soft);
        }
        .line.short {
          width: 60%;
        }
        .cur {
          width: 12px;
          height: 12px;
          background: var(--green);
          box-shadow: 0 0 6px var(--green);
        }
        .stand {
          width: 16px;
          height: 16px;
          background: var(--border);
        }
        .base {
          width: 70px;
          height: 8px;
          background: var(--border);
        }
        .floppy {
          width: 64px;
          height: 64px;
          background: var(--surface-2);
          border: 3px solid var(--border);
          box-shadow:
            inset 0 14px 0 -8px var(--dim),
            0 0 16px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
