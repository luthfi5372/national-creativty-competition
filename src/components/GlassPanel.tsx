"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverRotate?: number;
  delay?: number;
  onClick?: () => void;
}

export default function GlassPanel({
  children,
  className = "",
  hoverScale = 1.03,
  hoverRotate = 1,
  delay = 0,
  onClick,
}: GlassPanelProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        scale: hoverScale,
        rotateY: hoverRotate,
        rotateX: -hoverRotate * 0.5,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`glass-panel relative overflow-hidden group ${className}`}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Shimmer on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: "200%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(34, 211, 238, 0.08) 50%, transparent 70%)",
          }}
        />
      )}

      {/* Glow border on hover */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow:
            "inset 0 0 1px rgba(34, 211, 238, 0.4), 0 0 20px rgba(34, 211, 238, 0.1)",
        }}
      />

      {children}
    </motion.div>
  );
}
