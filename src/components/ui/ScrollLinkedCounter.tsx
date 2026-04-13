"use client";

import { useRef } from "react";
import {
  useTransform,
  useSpring,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";

interface ScrollCounterProps {
  value: number;
  className?: string;
}

/**
 * A counter that is directly tied to scroll position.
 * Counts UP as user scrolls toward the section, DOWN as they scroll away.
 */
export function ScrollCounter({ className = "" }: Omit<ScrollCounterProps, "value">) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      0
    </span>
  );
}

interface ScrollLinkedCounterProps {
  value: number;
  scrollProgress: MotionValue<number>;
  inputRange?: [number, number];
  className?: string;
}

/**
 * A counter that directly reads a shared scrollProgress MotionValue.
 */
export function ScrollLinkedCounter({
  value,
  scrollProgress,
  inputRange = [0.1, 0.6],
  className = "",
}: ScrollLinkedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const raw = useTransform(scrollProgress, inputRange, [0, value]);
  const smoothed = useSpring(raw, { stiffness: 80, damping: 20 });

  useMotionValueEvent(smoothed, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = Math.round(latest).toLocaleString("id-ID");
    }
  });

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      0
    </span>
  );
}


