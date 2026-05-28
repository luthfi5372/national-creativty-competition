"use client";

import { useEffect } from "react";

// Lenis is imported DYNAMICALLY inside useEffect
// This ensures it NEVER runs on the server (lenis accesses window at module level)
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any;
    let rafId: number;

    const initLenis = async () => {
      if (window.innerWidth <= 768) {
        // Skip Lenis on mobile devices for smooth native GPU scrolling
        return;
      }
      const { default: Lenis } = await import("lenis");
      lenis = new Lenis({
        lerp: 0.05,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 2,
      });

      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    };

    initLenis();

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
