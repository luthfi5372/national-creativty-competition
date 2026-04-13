"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ShineBorderProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  duration?: number;
  colors?: string[];
  borderWidth?: number;
}

/**
 * ShineBorder — Animated rotating gradient border
 * Terinspirasi dari Magic UI / magicui.design
 * Diimplementasikan murni dengan Framer Motion (tanpa install library tambahan)
 */
export function ShineBorder({
  children,
  className = "",
  innerClassName = "",
  duration = 5,
  colors = ["#6366f1", "#a855f7", "#ec4899", "#6366f1"],
  borderWidth = 1.5,
}: ShineBorderProps) {
  const gradient = `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colors[0]} 60deg, ${colors[1]} 120deg, ${colors[2]} 180deg, ${colors[3] ?? colors[0]} 240deg, transparent 300deg)`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ padding: `${borderWidth}px` }}
    >
      {/* Rotating Shine Beam */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: "-150%",
          background: gradient,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner Content */}
      <div className={`relative rounded-[14px] bg-white z-10 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
