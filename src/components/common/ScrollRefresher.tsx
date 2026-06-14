"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/hooks/useScrollAnimation";

/**
 * Syncs all ScrollTrigger positions once every section has mounted and again
 * after fonts/images settle, so pinned/scrubbed triggers measure correctly.
 */
export default function ScrollRefresher() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    refresh();
    const t = window.setTimeout(refresh, 400);
    window.addEventListener("load", refresh);
    if (document.fonts) {
      document.fonts.ready.then(refresh).catch(() => {});
    }
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
