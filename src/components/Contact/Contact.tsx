"use client";

import { useState } from "react";
import type { Personal } from "@/lib/types";
import Typewriter from "@/components/common/Typewriter";
import { playModem, playComplete } from "@/lib/audio";

interface ContactProps {
  personal: Personal;
}

type Status = "idle" | "sending" | "done";

export default function Contact({ personal }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", subject: "", message: "" });
  const [error, setError] = useState("");

  const githubHandle = personal.github.replace(/^https?:\/\//, "");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const transmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    if (!form.name.trim() || !form.message.trim()) {
      setError("ERR: NAME AND MSG REQUIRED");
      return;
    }
    setError("");
    setStatus("sending");
    playModem();
    window.setTimeout(() => {
      setStatus("done");
      playComplete();
    }, 1900);
  };

  const reset = () => {
    setStatus("idle");
    setForm({ name: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <Typewriter
          as="h2"
          className="section-title"
          text="> CONNECT.EXE — ESTABLISH_LINK"
        />

        <div className="bbs">
          {/* ---- connection header ---- */}
          <div className="bbs__head">
            <div className="bbs__line">
              CONNECTING TO:{" "}
              <span className="green">
                {personal.handle.replace(".SYS", "")}_TERMINAL
              </span>
              <span className="blink">_</span>
            </div>
            <div className="bbs__line dim">
              BAUD RATE: 9600 · PROTOCOL: TCP/IP
            </div>
            <div className="bbs__line bbs__status">
              <span>STATUS:</span>
              <span className="bar" aria-hidden style={{ maxWidth: 200 }}>
                <span className="bar__fill" style={{ width: "82%" }} />
              </span>
              <span className="green">LINK ESTABLISHED</span>
            </div>
          </div>

          {/* ---- body ---- */}
          <div className="bbs__body">
            {status === "done" ? (
              <div className="bbs__done">
                <p className="green crt-text" style={{ fontSize: "0.8rem" }}>
                  TRANSMISSION COMPLETE ✓
                </p>
                <p className="dim" style={{ fontSize: "0.55rem", lineHeight: 2 }}>
                  {">"} packet delivered to {personal.handle}
                  <br />
                  {">"} thanks, {form.name || "stranger"} — i&apos;ll reply soon.
                </p>
                <button className="pixel-btn" onClick={reset}>
                  [ NEW MESSAGE ]
                </button>
              </div>
            ) : (
              <form className="bbs__form" onSubmit={transmit}>
                <p className="green" style={{ fontSize: "0.6rem" }}>
                  {">"} SEND MESSAGE
                </p>

                <label className="field">
                  <span className="field__label">NAME:</span>
                  <input
                    className="field__input"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="your_handle"
                    disabled={status === "sending"}
                  />
                </label>

                <label className="field">
                  <span className="field__label">SUBJECT:</span>
                  <input
                    className="field__input"
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="re: opportunity"
                    disabled={status === "sending"}
                  />
                </label>

                <label className="field field--msg">
                  <span className="field__label">MSG:</span>
                  <textarea
                    className="field__input field__textarea"
                    value={form.message}
                    onChange={set("message")}
                    placeholder="type your message..."
                    rows={4}
                    disabled={status === "sending"}
                  />
                </label>

                {error && <p className="red bbs__err">{error}</p>}

                {status === "sending" ? (
                  <div className="bbs__sending">
                    <span className="amber">SENDING...</span>
                    <span className="bar" aria-hidden>
                      <span className="bar__fill bar__fill--amber sending" />
                    </span>
                  </div>
                ) : (
                  <button type="submit" className="pixel-btn">
                    [ TRANSMIT >>> ]
                  </button>
                )}
              </form>
            )}
          </div>

          {/* ---- footer ---- */}
          <div className="bbs__foot">
            <a href={personal.github} target="_blank" rel="noopener noreferrer">
              <span className="dim">GITHUB:</span>{" "}
              <span className="green">{githubHandle}</span>
            </a>
            <a href={`mailto:${personal.email}`}>
              <span className="dim">EMAIL:</span>{" "}
              <span className="green">{personal.email}</span>
            </a>
            <span>
              <span className="dim">LOC:</span> {personal.location}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bbs {
          border: 2px solid var(--green);
          background: var(--surface);
          box-shadow:
            0 0 0 2px var(--bg),
            0 0 30px var(--green-dim),
            inset 0 0 40px rgba(0, 0, 0, 0.5);
        }
        .bbs__head {
          padding: var(--space-3);
          border-bottom: 2px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 0.55rem;
        }
        .bbs__status {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .bbs__status .bar {
          flex: 1;
          height: 12px;
        }
        .bbs__body {
          padding: var(--space-4) var(--space-3);
        }
        .bbs__form {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          max-width: 560px;
        }
        .field {
          display: grid;
          grid-template-columns: 84px 1fr;
          align-items: center;
          gap: 12px;
        }
        .field--msg {
          align-items: start;
        }
        .field__label {
          font-size: 0.55rem;
          color: var(--amber);
        }
        .field__input {
          background: transparent;
          border: none;
          border-bottom: 2px solid var(--border);
          padding: 8px 4px;
          font-size: 0.55rem;
          color: var(--green);
          outline: none;
          width: 100%;
          caret-color: var(--green);
          transition: border-color 0.1s steps(2), box-shadow 0.1s steps(2);
        }
        .field__input::placeholder {
          color: var(--dim);
        }
        .field__input:focus {
          border-bottom-color: var(--green);
          box-shadow: 0 2px 8px -4px var(--green);
        }
        .field__textarea {
          resize: vertical;
          line-height: 1.9;
          border: 2px solid var(--border);
          min-height: 90px;
        }
        .field__textarea:focus {
          border-color: var(--green);
        }
        .bbs__err {
          font-size: 0.5rem;
          letter-spacing: 1px;
        }
        .bbs__sending {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.55rem;
        }
        .bbs__sending .bar {
          flex: 1;
          height: 14px;
        }
        .sending {
          width: 0;
          animation: fill-bar 1.8s steps(20) forwards;
        }
        @keyframes fill-bar {
          to {
            width: 100%;
          }
        }
        .bbs__done {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          align-items: flex-start;
        }
        .bbs__foot {
          padding: var(--space-3);
          border-top: 2px solid var(--border);
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2) var(--space-4);
          font-size: 0.5rem;
        }
        .bbs__foot a:hover .green {
          text-shadow: 0 0 8px var(--green-soft);
        }
        @media (max-width: 768px) {
          .field {
            grid-template-columns: 70px 1fr;
          }
        }
      `}</style>
    </section>
  );
}
