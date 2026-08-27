"use client";

import { useEffect, ReactNode } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // 1.2 seconds to reach the bottom (Smooth, slow glide)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxury ease
      smoothWheel: true, // Smooths out fast mouse wheel spins
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}