"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import { techColor } from "@/lib/colors";
import { playInsert } from "@/lib/audio";

interface FloppyDiskProps {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}

export default function FloppyDisk({
  project,
  index,
  onSelect,
}: FloppyDiskProps) {
  const [inserting, setInserting] = useState(false);
  const isLive = project.status === "LIVE";

  const handleClick = () => {
    if (inserting) return;
    playInsert();
    setInserting(true);
    window.setTimeout(() => onSelect(project), 360);
    window.setTimeout(() => setInserting(false), 700);
  };

  return (
    <button
      className={`disk${inserting ? " disk--inserting" : ""}`}
      onClick={handleClick}
      aria-label={`Open ${project.label} project disk`}
      style={{ ["--i" as string]: index }}
    >
      {/* status LED */}
      <span
        className={`disk__led ${isLive ? "led-dot" : "led-dot--amber"} ${
          isLive ? "led-dot--pulse" : ""
        }`}
        title={project.status}
        aria-hidden
      />

      {/* shutter assembly */}
      <span className="disk__top">
        <span className="disk__media" aria-hidden />
        <span className="disk__shutter" aria-hidden>
          <span className="disk__shutter-slit" />
        </span>
      </span>

      {/* label */}
      <span className="disk__label">
        <span className="disk__name">{project.label}</span>
        <span className="disk__cat">
          {project.category} · {project.subcategory}
        </span>
        <span className="disk__stack" aria-hidden>
          {project.stack.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="disk__chip"
              title={tech}
              style={{ background: techColor(tech) }}
            />
          ))}
        </span>
        <span className="disk__file dim">{project.id}.exe</span>
      </span>

      <span className="disk__hint">▼ INSERT</span>

      <style jsx>{`
        .disk {
          position: relative;
          width: 220px;
          min-width: 220px;
          height: 240px;
          background: linear-gradient(160deg, #20202e 0%, #15151f 100%);
          border: 2px solid var(--border);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.5);
          transition:
            transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.3s steps(3),
            border-color 0.2s steps(2);
          /* top-right cut corner = floppy write-protect bevel */
          clip-path: polygon(
            0 0,
            calc(100% - 26px) 0,
            100% 26px,
            100% 100%,
            0 100%
          );
        }
        .disk:hover {
          transform: translateY(-20px);
          border-color: var(--green);
          box-shadow:
            0 26px 30px rgba(0, 0, 0, 0.55),
            0 0 22px var(--green-dim);
        }
        .disk--inserting {
          transform: translateY(46px) scale(0.96);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
        }

        .disk__led {
          position: absolute;
          top: 12px;
          right: 14px;
          width: 9px;
          height: 9px;
          z-index: 2;
        }

        .disk__top {
          position: relative;
          height: 58px;
          background: #0e0e16;
          border: 2px solid #2f2f44;
          overflow: hidden;
          display: block;
        }
        .disk__media {
          position: absolute;
          inset: 6px;
          background: repeating-linear-gradient(
            45deg,
            #232336 0,
            #232336 4px,
            #1a1a28 4px,
            #1a1a28 8px
          );
        }
        .disk__shutter {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 64px;
          height: 100%;
          background: linear-gradient(
            180deg,
            #c9c9d6 0%,
            #8a8aa0 45%,
            #b4b4c4 100%
          );
          border-left: 2px solid #6a6a80;
          border-right: 2px solid #d8d8e4;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .disk__shutter-slit {
          width: 8px;
          height: 70%;
          background: #5a5a70;
          box-shadow: inset 0 0 0 2px #2f2f44;
        }
        .disk:hover .disk__shutter {
          transform: translateX(-50%) translateY(-86%);
        }

        .disk__label {
          flex: 1;
          background: linear-gradient(180deg, #e6e4d4 0%, #cfcdbb 100%);
          border: 2px solid #b3b1a0;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #1a1a26;
        }
        .disk__name {
          font-size: 0.62rem;
          line-height: 1.5;
          color: #14141d;
        }
        .disk__cat {
          font-size: 0.42rem;
          color: #4a4a5a;
          letter-spacing: 0.5px;
        }
        .disk__stack {
          display: flex;
          gap: 5px;
          margin-top: auto;
        }
        .disk__chip {
          width: 11px;
          height: 11px;
          border: 1px solid rgba(0, 0, 0, 0.35);
        }
        .disk__file {
          font-size: 0.4rem;
          color: #6a6a5a;
        }

        .disk__hint {
          font-size: 0.42rem;
          color: var(--green);
          letter-spacing: 1px;
          opacity: 0;
          text-align: center;
          transition: opacity 0.2s steps(2);
        }
        .disk:hover .disk__hint {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .disk {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </button>
  );
}
