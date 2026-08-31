"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with ultra-smooth settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true, // <--- Only scrolls smoothly with mouse wheel
      // NO smoothTouch needed! Lenis auto-disables touch scrolling
    });

    lenisRef.current = lenis;

    // Connect Lenis to requestAnimationFrame for 60fps performance
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Clean up on unmount
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}