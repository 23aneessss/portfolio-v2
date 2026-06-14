"use client";

import { useEffect, useState } from "react";

interface NavigationProps {
  handle: string;
}

const LINKS = [
  { label: "ABOUT", href: "#about" },
  { label: "WORK", href: "#projects" },
  { label: "SKILLS", href: "#skills" },
  { label: "PATH", href: "#timeline" },
  { label: "CONNECT", href: "#contact" },
];

export default function Navigation({ handle }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll while the mobile menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "var(--nav-h)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-3)",
          background: scrolled ? "rgba(10,10,15,0.82)" : "transparent",
          borderBottom: scrolled
            ? "2px solid var(--border)"
            : "2px solid transparent",
          backdropFilter: scrolled ? "blur(4px)" : "none",
          transition: "background 120ms steps(2), border-color 120ms steps(2)",
        }}
      >
        {/* left — site name */}
        <button
          onClick={() => go("#hero")}
          className="green crt-text"
          style={{
            fontSize: "0.72rem",
            letterSpacing: "1px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            className="led-dot led-dot--pulse"
            style={{ width: 7, height: 7 }}
            aria-hidden
          />
          {handle}
        </button>

        {/* center — desktop links */}
        <ul className="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <button className="nav-link" onClick={() => go(l.href)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* right — traffic-light dots (desktop) + hamburger (mobile) */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="nav-dots" aria-hidden>
            <span style={{ background: "var(--red)", boxShadow: "0 0 6px var(--red)" }} />
            <span style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} />
            <span style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
          </div>

          <button
            className="nav-burger"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* mobile full-screen terminal menu */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(10,10,15,0.97)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "var(--space-3)",
            padding: "var(--space-6) var(--space-3)",
          }}
        >
          <p className="dim" style={{ fontSize: "0.6rem", marginBottom: "var(--space-2)" }}>
            {">"} MAIN_MENU.SYS
          </p>
          {LINKS.map((l, i) => (
            <button
              key={l.href}
              className="green crt-text"
              onClick={() => go(l.href)}
              style={{
                fontSize: "1.1rem",
                textAlign: "left",
                letterSpacing: "2px",
              }}
            >
              {String(i + 1).padStart(2, "0")} {">"} [ {l.label} ]
            </button>
          ))}
          <button
            className="pixel-btn pixel-btn--amber"
            style={{ marginTop: "var(--space-4)", alignSelf: "flex-start" }}
            onClick={() => setOpen(false)}
          >
            [ CLOSE × ]
          </button>
        </div>
      )}

      <style jsx>{`
        .nav-links {
          display: flex;
          gap: var(--space-3);
          list-style: none;
        }
        .nav-link {
          position: relative;
          font-size: 0.6rem;
          letter-spacing: 1px;
          color: var(--white);
          padding: 6px 2px;
          transition: color 90ms steps(2);
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 2px;
          background: var(--green);
          box-shadow: 0 0 8px var(--green-soft);
          transition: width 90ms steps(3);
        }
        .nav-link:hover {
          color: var(--green);
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-dots {
          display: flex;
          gap: 7px;
        }
        .nav-dots span {
          width: 9px;
          height: 9px;
          display: block;
        }
        .nav-burger {
          display: none;
          flex-direction: column;
          gap: 3px;
          padding: 6px;
          border: 2px solid var(--border);
        }
        .nav-burger span {
          width: 18px;
          height: 3px;
          background: var(--green);
          box-shadow: 0 0 6px var(--green-soft);
        }
        @media (max-width: 768px) {
          .nav-links,
          .nav-dots {
            display: none;
          }
          .nav-burger {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
