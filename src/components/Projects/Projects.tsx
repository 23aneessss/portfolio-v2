"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { gsap, ScrollTrigger } from "@/hooks/useScrollAnimation";
import { techColor } from "@/lib/colors";
import Typewriter from "@/components/common/Typewriter";
import FloppyDisk from "./FloppyDisk";

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [visible, setVisible] = useState(false);

  // ---- horizontal pinned scroll (desktop only) ----
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth + 64;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 300);

    return () => {
      mm.revert();
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
    };
  }, [projects.length]);

  const open = (p: Project) => {
    setSelected(p);
    requestAnimationFrame(() => setVisible(true));
  };
  const close = () => {
    setVisible(false);
    window.setTimeout(() => setSelected(null), 320);
  };

  return (
    <section id="projects" ref={sectionRef} className="projects">
      <div className="projects__head container">
        <Typewriter
          as="h2"
          className="section-title"
          text="> FLOPPY_DISK:/PROJECTS/"
        />
        <p className="dim projects__hint">
          {projects.length} DISKS · SCROLL TO BROWSE →
        </p>
      </div>

      <div className="projects__viewport">
        <div ref={trackRef} className="projects__track">
          {projects.map((p, i) => (
            <FloppyDisk key={p.id} project={p} index={i} onSelect={open} />
          ))}
          <div className="projects__end" aria-hidden>
            <span className="green">END_OF_DIR</span>
            <span className="dim">{projects.length} files listed</span>
          </div>
        </div>
      </div>

      {/* ---- retro OS detail window ---- */}
      {selected && (
        <div
          className={`win-backdrop${visible ? " is-open" : ""}`}
          onClick={close}
        >
          <div
            className={`win${visible ? " is-open" : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.label} details`}
          >
            <div className="win__bar">
              <span>[ DISK LOADED ]</span>
              <button className="win__x" onClick={close} aria-label="Close">
                ×
              </button>
            </div>

            <div className="win__body">
              <div className="win__row">
                <span className="dim">FILENAME:</span>
                <span className="green">{selected.id}.exe</span>
              </div>
              <div className="win__row">
                <span className="dim">TYPE:</span>
                <span>
                  {selected.category} — {selected.subcategory}
                </span>
              </div>
              <div className="win__row">
                <span className="dim">STATUS:</span>
                <span
                  className={
                    selected.status === "LIVE" ? "green" : "amber"
                  }
                >
                  <span
                    className={
                      selected.status === "LIVE"
                        ? "led-dot led-dot--pulse"
                        : "led-dot--amber"
                    }
                    style={{
                      display: "inline-block",
                      width: 9,
                      height: 9,
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                    aria-hidden
                  />
                  {selected.status}
                </span>
              </div>

              <div className="win__desc">
                <span className="dim">DESC:</span> {selected.description}
              </div>

              <div className="win__stack">
                <span className="dim">STACK:</span>
                <span className="win__chips">
                  {selected.stack.map((tech) => (
                    <span
                      key={tech}
                      className="win__chip"
                      style={{
                        borderColor: techColor(tech),
                        color: techColor(tech),
                      }}
                    >
                      [{tech}]
                    </span>
                  ))}
                </span>
              </div>

              <div className="win__foot">
                {selected.link ? (
                  <a
                    className="pixel-btn"
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [ VIEW SOURCE ]
                  </a>
                ) : (
                  <span className="pixel-btn pixel-btn--red">
                    [ CLASSIFIED ]
                  </span>
                )}
                <button className="pixel-btn pixel-btn--amber" onClick={close}>
                  [ CLOSE × ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .projects {
          position: relative;
          padding: var(--space-12) 0;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(57, 255, 20, 0.015),
            transparent
          );
        }
        .projects__head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-2);
        }
        .projects__hint {
          font-size: 0.5rem;
          letter-spacing: 1px;
        }
        .projects__viewport {
          overflow: hidden;
          margin-top: var(--space-6);
        }
        .projects__track {
          display: flex;
          gap: var(--space-3);
          padding: 30px max(24px, 6vw);
          width: max-content;
          align-items: stretch;
        }
        .projects__end {
          min-width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 2px dashed var(--border);
          font-size: 0.5rem;
        }

        /* ---- window ---- */
        .win-backdrop {
          position: fixed;
          inset: 0;
          z-index: 500;
          background: rgba(5, 5, 9, 0);
          transition: background 0.3s steps(3);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .win-backdrop.is-open {
          background: rgba(5, 5, 9, 0.72);
        }
        .win {
          width: min(640px, 94vw);
          margin: 0 auto max(24px, 5vh);
          background: var(--surface);
          border: 2px solid var(--green);
          box-shadow:
            0 0 0 2px var(--bg),
            0 0 40px var(--green-dim);
          transform: translateY(110%);
          transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .win.is-open {
          transform: translateY(0);
        }
        .win__bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--green);
          color: var(--bg);
          padding: 8px 12px;
          font-size: 0.6rem;
          letter-spacing: 1px;
        }
        .win__x {
          color: var(--bg);
          font-size: 0.9rem;
          line-height: 1;
          padding: 0 4px;
        }
        .win__body {
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-size: 0.58rem;
        }
        .win__row {
          display: flex;
          gap: 10px;
        }
        .win__desc {
          line-height: 2;
          color: var(--white);
          border-left: 2px solid var(--border);
          padding-left: 12px;
        }
        .win__stack {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .win__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .win__chip {
          font-size: 0.5rem;
          border: 2px solid;
          padding: 4px 6px;
        }
        .win__foot {
          display: flex;
          justify-content: space-between;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-top: 6px;
        }

        @media (max-width: 768px) {
          .projects__viewport {
            overflow: visible;
          }
          .projects__track {
            width: auto;
            flex-wrap: wrap;
            justify-content: center;
            padding: 20px var(--space-2);
            gap: var(--space-3);
          }
          .projects__end {
            width: 100%;
            min-height: 90px;
          }
        }
      `}</style>
    </section>
  );
}
