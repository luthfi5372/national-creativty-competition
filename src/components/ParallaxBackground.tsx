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
  // Generate 150 elements to ensure the whole long page is populated
  for (let i = 0; i < 150; i++) {
    const itemConfig = allIconsMapped[i % allIconsMapped.length];
    
    // Spread vertically across 600vh (6 screen heights)
    const factorLevel = (i * 29) % 650; // 0 to 650 vh
    // Spread horizontally across 100vw
    const factorX = (i * 13) % 100;
    
    const size = 32 + ((i * 7) % 100); // 32px to 132px
    const depth = 1 + ((i * 19) % 4); // 1 to 4 parallax speed
    const opacity = 0.20 + (((i * 11) % 25) / 100); 
    const rotate = (i * 45) % 360;
    const blur = depth > 3 ? "blur(5px)" : depth > 2 ? "blur(2px)" : "blur(0px)";

    elements.push({
      id: i,
      Icon: itemConfig.Icon,
      color: itemConfig.color,
      x: factorX,        // vw
      y: factorLevel,    // vh starting
      size,
      depth,             // parallax speed multiplier
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useGSAP(() => {
    if (!mounted || isMobile) return; // Completely skip heavy scroll triggers on mobile
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
    
  }, { scope: containerRef, dependencies: [mounted, isMobile] });

  // Hide before mounted to prevent hydration errors or flashes
  if (!mounted) return null;

  // Reduce background clutter and nodes on mobile to keep scrolling silky-smooth
  const displayedItems = isMobile ? items.slice(0, 25) : items;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }} // Put behind everything
    >
      <div className="absolute inset-0 bg-slate-50" /> {/* Solid background at the very back */}
      
      {displayedItems.map((item) => (
        <div
          key={item.id}
          className={`parallax-item absolute ${item.color}`}
          data-depth={item.depth}
          style={{
            left: `${item.x}vw`,
            top: `${item.y}vh`,
            opacity: isMobile ? item.opacity * 0.6 : item.opacity, // Fader on mobile for high readability
            transform: `rotate(${item.rotate}deg)`,
            filter: isMobile ? "blur(3px)" : item.blur, // Soft blur on mobile to avoid clashing with text
            willChange: "transform",
          }}
        >
          <item.Icon size={isMobile ? item.size * 0.6 : item.size} strokeWidth={1.5} />
        </div>
      ))}
      
      {/* Subtle overlay to fade out overlapping icons at the very top and bottom */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-50 to-transparent z-10" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50 to-transparent z-10" />
    </div>
  );
}
