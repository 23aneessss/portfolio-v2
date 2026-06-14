import type { Metadata, Viewport } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import CRTOverlay from "@/components/CRTOverlay/CRTOverlay";
import BootSequence from "@/components/BootSequence/BootSequence";
import data from "../../data/portfolio.json";

// Declared ONCE here and applied to the whole document via a CSS variable.
// Every glyph on the site renders in Press Start 2P.
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const { personal } = data;

export const metadata: Metadata = {
  title: `${personal.handle} — ${personal.name}`,
  description: `${personal.title} · ${personal.school}. A pixel-art retro-OS portfolio.`,
  authors: [{ name: personal.name, url: personal.github }],
  keywords: [
    "portfolio",
    "developer",
    "pixel art",
    "retro",
    "Next.js",
    "Three.js",
    personal.name,
  ],
  openGraph: {
    title: `${personal.handle} — ${personal.name}`,
    description: personal.title,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={pressStart.variable}>
      <body>
        {/* page content */}
        {children}

        {/* always-on global effects, drawn above content, never interactive */}
        <div className="phosphor-bloom" aria-hidden="true" />
        <CRTOverlay />

        {/* boot terminal — plays once on first client mount, then dissolves */}
        <BootSequence handle={personal.handle} />
      </body>
    </html>
  );
}
