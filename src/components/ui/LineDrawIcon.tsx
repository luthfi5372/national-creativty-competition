"use client";

import React, { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface LineDrawIconProps {
  icon: any;
  size?: number;
  className?: string;
  delay?: number;
  duration?: number;
}

export default function LineDrawIcon({
  icon: Icon,
  size = 24,
  className = "",
  delay = 0,
  duration = 2,
}: LineDrawIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && ref.current) {
      const paths = ref.current.querySelectorAll("path, circle, rect, line, polyline, polygon");
      
      paths.forEach((el) => {
        const path = el as SVGGeometryElement;
        const length = path.getTotalLength();
        path.style.strokeDasharray = length.toString();
        path.style.strokeDashoffset = length.toString();
        
        // Initial state
        path.style.opacity = "0";
        
        // Trigger animation
        setTimeout(() => {
          path.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 0.3s ease ${delay}s`;
          path.style.strokeDashoffset = "0";
          path.style.opacity = "1";
        }, 50);
      });
    }
  }, [isInView, delay, duration]);

  return (
    <div ref={ref} className={`inline-flex items-center justify-center ${className}`}>
      <Icon size={size} className={className} strokeWidth={1.5} />
    </div>
  );
}
