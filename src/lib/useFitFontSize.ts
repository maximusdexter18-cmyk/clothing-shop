"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface FitOptions {
  base?: number;
  min?: number;
  max?: number;
  // Fraction of the viewport height the heading is allowed to occupy
  // (reserves room for the fixed nav, subtitle and button below it).
  heightFraction?: number;
}

/**
 * Measures the widest WORD and the total stacked height of `text` (each word on
 * its own line, matching how the hero renders it) and returns a font size (px)
 * so the text fits BOTH the container width and the available viewport height.
 * Long owner-set taglines shrink to fit instead of overflowing above the nav.
 */
export function useFitFontSize(
  text: string,
  { base = 64, min = 18, max = 110, heightFraction = 0.6 }: FitOptions = {}
) {
  const ref = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(base);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      const avail = el.clientWidth;
      if (!avail || typeof window === "undefined") return;

      const family = getComputedStyle(el).fontFamily;

      // Build a hidden probe that mirrors the real render: each word on its own line.
      const probe = document.createElement("div");
      probe.style.cssText =
        `position:absolute;visibility:hidden;left:-99999px;top:0;width:${avail}px;` +
        `font-weight:700;font-family:${family};font-size:${base}px;line-height:1;`;
      for (const word of text.split(" ")) {
        const line = document.createElement("div");
        line.textContent = word || " ";
        line.style.cssText = "white-space:nowrap;";
        probe.appendChild(line);
      }
      document.body.appendChild(probe);

      let widest = 0;
      probe.childNodes.forEach((node) => {
        const w = (node as HTMLElement).getBoundingClientRect().width;
        if (w > widest) widest = w;
      });
      const totalHeight = probe.getBoundingClientRect().height;
      document.body.removeChild(probe);

      if (widest <= 0 || totalHeight <= 0) return;

      const widthScale = base * Math.min(1, avail / widest);
      const availHeight = Math.max(
        120,
        window.innerHeight * heightFraction
      );
      const heightScale = base * Math.min(1, availHeight / totalHeight);

      const scaled = Math.min(widthScale, heightScale);
      // Clamp to viewport width - prevent overflow on very narrow screens
      const viewportMax = Math.min(max, window.innerWidth * 0.9);
      setFontSize(Math.max(min, Math.min(viewportMax, scaled)));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [text, base, min, max, heightFraction]);

  return { ref, fontSize };
}
