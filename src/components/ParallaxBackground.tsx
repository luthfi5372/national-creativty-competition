"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Mic,
  MessageCircle,
  Volume2,
  BookOpen,
  PenTool,
  Microscope,
  Atom,
  Star,
  Moon,
  Book,
  Rocket,
  Calculator,
  Telescope,
  Dna,
} from "lucide-react";

const categoryIcons = [
  { icons: [Mic, MessageCircle, Volume2], color: "text-red-400" },          // Speech
  { icons: [BookOpen, PenTool, Microscope, Atom], color: "text-emerald-400" }, // LKTI
  { icons: [Star, Moon, Book], color: "text-amber-400" },                   // MTQ
  { icons: [Rocket, Calculator, Telescope, Dna], color: "text-blue-400" }     // MIPA
];

// Flat array to pick randomly but know the color
const allIconsMapped = categoryIcons.flatMap(cat => 
  cat.icons.map(Icon => ({ Icon, color: cat.color }))
);

// Pre-generated positions to avoid hydration mismatch
const generateElements = () => {
  const elements = [];
  // Optimized for performance: Reduce to 45 quality elements
  for (let i = 0; i < 45; i++) {
    const itemConfig = allIconsMapped[i % allIconsMapped.length];
    
    // Spread vertically across 1000vh (Height of the long landing page)
    const factorLevel = (i * 22) % 1000; 
    // Sparse horizontal distribution
    const factorX = (i * 17) % 100;
    
    const size = 32 + ((i * 13) % 80); // 32px to 112px
    const depth = 0.5 + ((i * 3) % 3); // 0.5 to 3.5 parallax speed
    const opacity = 0.15 + (((i * 7) % 20) / 100); 
    const rotate = (i * 45) % 360;
    const blur = depth > 3 ? "blur(4px)" : depth > 2 ? "blur(1.5px)" : "blur(0px)";

    elements.push({
      id: i,
      Icon: itemConfig.Icon,
      color: itemConfig.color,
      x: factorX,
      y: factorLevel,
      size,
      depth,
      opacity,
      rotate,
      blur
    });
  }
  return elements;
};

const items = generateElements();

export default function ParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useGSAP(() => {
    if (!mounted) return;
    gsap.registerPlugin(ScrollTrigger);

    const parallaxItems = gsap.utils.toArray<HTMLElement>(".parallax-item");

    parallaxItems.forEach((item) => {
      const depth = parseFloat(item.dataset.depth || "1");
      
      // Move items UPwards as user scrolls DOWN
      // Deeper items (higher depth) move faster
      gsap.to(item, {
        y: () => -1 * window.innerHeight * depth,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5, // Smooth scrubbing taking 1.5s to catch up
        }
      });
      
      // Add a slight continuous rotation
      gsap.to(item, {
        rotation: "+=45",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true
        }
      });
    });
    
  }, { scope: containerRef, dependencies: [mounted] });

  // Hide before mounted to prevent hydration errors or flashes
  if (!mounted) return null;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }} // Put behind everything
    >
      <div className="absolute inset-0 bg-slate-50" /> {/* Solid background at the very back */}
      
      {items.map((item) => (
        <div
          key={item.id}
          className={`parallax-item absolute ${item.color}`}
          data-depth={item.depth}
          style={{
            left: `${item.x}vw`,
            top: `${item.y}vh`,
            opacity: item.opacity,
            transform: `rotate(${item.rotate}deg)`,
            filter: item.blur, 
            willChange: "transform",
          }}
        >
          <item.Icon size={item.size} strokeWidth={1.5} />
        </div>
      ))}
      
      {/* Subtle overlay to fade out overlapping icons at the very top and bottom */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />
    </div>
  );
}
