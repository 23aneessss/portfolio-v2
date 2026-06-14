// Deterministic accent color for a tech name — used for stack chips and
// inventory icon marks so the same tech always reads the same color.

const PALETTE = [
  "#39ff14",
  "#ffb000",
  "#ff2e2e",
  "#3a8ee6",
  "#caa000",
  "#b06bd6",
  "#2fae6a",
  "#e8e8e8",
  "#ff6b9d",
];

export function techColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}
