import type { PortfolioData } from "@/lib/types";
import raw from "../../data/portfolio.json";

import Navigation from "@/components/Navigation/Navigation";
import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Projects from "@/components/Projects/Projects";
import Skills from "@/components/Skills/Skills";
import Timeline from "@/components/Timeline/Timeline";
import Contact from "@/components/Contact/Contact";
import RevealSection from "@/components/common/RevealSection";
import ScrollRefresher from "@/components/common/ScrollRefresher";

// single static import — the entire site is driven by this one file
const data = raw as unknown as PortfolioData;

export default function Home() {
  return (
    <>
      <Navigation handle={data.personal.handle} />

      <main>
        <Hero personal={data.personal} />

        <RevealSection>
          <About personal={data.personal} stats={data.stats} />
        </RevealSection>

        <Projects projects={data.projects} />

        <RevealSection>
          <Skills skills={data.skills} />
        </RevealSection>

        <Timeline timeline={data.timeline} />

        <RevealSection>
          <Contact personal={data.personal} />
        </RevealSection>
      </main>

      <footer className="site-footer">
        <div className="container">
          <span className="green">{data.personal.handle}</span>
          <span className="dim">
            {">"} crafted with pixels, three.js &amp; gsap · {data.personal.year} ·{" "}
            {data.personal.school}
          </span>
          <span className="dim">© {new Date().getFullYear()} · ALL SYSTEMS NOMINAL ●</span>
        </div>
      </footer>

      <ScrollRefresher />
    </>
  );
}
