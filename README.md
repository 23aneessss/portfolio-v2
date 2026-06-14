# ANESS.SYS — Pixel-Art Retro-OS Portfolio

A developer portfolio that boots like a forgotten 1987 computer and runs something
from the future. Every scroll is a level, every project is a floppy disk, and the
whole page is a living retro OS rendered on a CRT.

Built with **Next.js 15 (App Router) · TypeScript (strict) · Three.js · GSAP +
ScrollTrigger · Canvas · Press Start 2P**. Zero image assets — every visual is
generated procedurally via WebGL geometry, the Canvas API, or CSS.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
# production
npm run build && npm run start
```

Deploy to Vercel with `vercel --prod`. `data/portfolio.json` is bundled at build
time — no environment variables needed.

---

## Editing content — one file

**`data/portfolio.json` is the only file you edit to change content.** The root
`src/app/page.tsx` (a Server Component) imports it statically and passes typed
slices to each section. No component hardcodes content.

- **Add a project** → append an object to `projects[]` → a new floppy disk appears.
  - `link: null` renders a red, non-clickable `[ CLASSIFIED ]` button instead of `[ VIEW SOURCE ]`.
  - `status: "LIVE"` → solid green LED · `status: "IN PROGRESS"` → blinking amber LED.
- **Add a skill** → append `{ "name": "...", "value": 0–100 }` to the right array in
  `skills{}` → a new inventory slot + auto-generated pixel icon renders.
- **Add a timeline entry** → append to `timeline[]` → a new map node + path segment
  generate automatically and the walking sprite stops there.

Types live in `src/lib/types.ts` (`PortfolioData`, `Project`, `Skill`,
`TimelineEntry`, …) and exactly match the JSON schema.

---

## Structure

```
data/portfolio.json          ← THE ONLY FILE TO EDIT for content
src/
  app/
    layout.tsx               ← Press Start 2P (CSS var), metadata, global overlays
    page.tsx                 ← Server Component: imports JSON, renders sections
    globals.css              ← every design token + reusable retro primitives
  components/
    BootSequence/            ← CRT warm-up flicker → typing → pixel-dissolve wipe
    CRTOverlay/              ← always-on scanline canvas with downward drift
    Navigation/              ← retro OS menu bar + mobile terminal menu
    Hero/Hero.tsx            ← word-drop headline + CTAs
    Hero/PixelRoom.tsx       ← Three.js isometric voxel workspace (InstancedMesh)
    About/                   ← JRPG stat card (animated bars) + line-typed bio
    Projects/Projects.tsx    ← GSAP-pinned horizontal scroll of floppy disks
    Projects/FloppyDisk.tsx  ← individual 3.5" disk + insert animation + sound
    Skills/                  ← tabbed inventory grid, canvas pixel-icons, fast-fill bars
    Timeline/                ← pixel overworld map + sprite that walks as you scroll
    Contact/                 ← BBS terminal form + synthesized modem handshake
    common/                  ← Typewriter, RevealSection (floppy wipe), ScrollRefresher
  hooks/useScrollAnimation.ts← reusable GSAP ScrollTrigger setup
  lib/{audio,colors}.ts      ← Web Audio synth (no assets) + deterministic tech colors
```

---

## Notable engineering

- **Single `InstancedMesh`** renders the entire 3D diorama with per-instance colors
  (never one mesh per cube). Pixel ratio capped at 2 for stable 60fps. The CRT in
  the scene shows a live terminal via a `CanvasTexture` updated each frame; the
  camera orbits the Y axis and performs a cinematic zoom-in once boot completes.
- **All sounds are synthesized** at runtime with `OscillatorNode` / buffer noise
  (floppy click, dial-up modem handshake, completion chirp) — no audio files.
- **Box-drawing UIs are built with CSS frames, not literal `╔═║` glyphs**, because
  Press Start 2P doesn't ship those code points — this keeps the windows perfectly
  aligned and crisp while every actual character still renders in the pixel font.
- **`prefers-reduced-motion` is honored**: the boot sequence is skipped, the CRT
  draws a single static pass, typewriters render instantly, and stat/skill bars
  fill without transition.
- Fully responsive to ≥360px; the WebGL hero is swapped for a flat CSS pixel-art
  workstation below 768px and every section reflows to a single column.
