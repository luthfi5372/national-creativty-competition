"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function useMagnetic() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip magnetic effect on mobile devices for stable tap interactions
    if (window.innerWidth <= 768) return;

    const xTo = gsap.quickTo(element, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(element, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = element.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      // Maximal movement of 15px for a minimalist feel
      xTo(x * 0.35);
      yTo(y * 0.35);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
}
