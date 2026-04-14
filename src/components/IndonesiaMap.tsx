"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLiveStats } from "@/hooks/useLiveStats";
import { Info, TrendingUp, Users, MousePointer2, Map as MapIcon } from "lucide-react";
import * as d3 from "d3-geo";
import geoData from "@/data/indonesia-simple.json";

// Mapping provinces to major regions for coloring/stats
const PROVINCE_TO_REGION: Record<string, string> = {
  // Sumatera
  "DI. ACEH": "Sumatera", 
  "SUMATERA UTARA": "Sumatera", 
  "SUMATERA BARAT": "Sumatera", 
  "RIAU": "Sumatera", 
  "JAMBI": "Sumatera", 
  "SUMATERA SELATAN": "Sumatera", 
  "BENGKULU": "Sumatera", 
  "LAMPUNG": "Sumatera", 
  "BANGKA BELITUNG": "Sumatera", 
  "KEPULAUAN RIAU": "Sumatera",
  // Jawa
  "DKI JAKARTA": "Jawa", 
  "JAWA BARAT": "Jawa", 
  "JAWA TENGAH": "Jawa", 
  "DAERAH ISTIMEWA YOGYAKARTA": "Jawa", 
  "JAWA TIMUR": "Jawa", 
  "PROBANTEN": "Jawa",
  // Bali & Nusa Tenggara
  "BALI": "Bali & Nusa Tenggara", 
  "NUSATENGGARA BARAT": "Bali & Nusa Tenggara", 
  "NUSA TENGGARA TIMUR": "Bali & Nusa Tenggara",
  // Kalimantan
  "KALIMANTAN BARAT": "Kalimantan", 
  "KALIMANTAN TENGAH": "Kalimantan", 
  "KALIMANTAN SELATAN": "Kalimantan", 
  "KALIMANTAN TIMUR": "Kalimantan", 
  "KALIMANTAN UTARA": "Kalimantan",
  // Sulawesi
  "SULAWESI UTARA": "Sulawesi", 
  "SULAWESI TENGAH": "Sulawesi", 
  "SULAWESI SELATAN": "Sulawesi", 
  "SULAWESI TENGGARA": "Sulawesi", 
  "GORONTALO": "Sulawesi", 
  "SULAWESI BARAT": "Sulawesi",
  // Papua
  "MALUKU": "Papua", 
  "MALUKU UTARA": "Papua", 
  "IRIAN JAYA BARAT": "Papua", 
  "IRIAN JAYA TENGAH": "Papua", 
  "IRIAN JAYA TIMUR": "Papua"
};

const REGIONS = ["Sumatera", "Jawa", "Bali & Nusa Tenggara", "Kalimantan", "Sulawesi", "Papua"];

class Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  size: number;
  baseSize: number;
  color: string;
  baseColor: string;
  density: number;
  opacity: number;
  baseOpacity: number;
  vx: number = 0;
  vy: number = 0;

  constructor(x: number, y: number, color: string) {
    this.baseX = x;
    this.baseY = y;
    this.x = x + (Math.random() - 0.5) * 20; // Slight initial offset
    this.y = y + (Math.random() - 0.5) * 20;
    this.baseSize = 1.6 + Math.random() * 0.8;
    this.size = this.baseSize;
    this.baseColor = color;
    this.color = color;
    this.baseOpacity = 0.25 + Math.random() * 0.4;
    this.opacity = this.baseOpacity;
    this.density = (Math.random() * 25) + 15;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    
    // Subtle glow if highly active
    if (this.opacity > 0.8) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    } else {
      ctx.shadowBlur = 0;
    }
  }

  update(mouse: { x: number | null, y: number | null, radius: number }) {
    if (mouse.x !== null && mouse.y !== null) {
      // Calculate distance from base position to cursor
      const dx = mouse.x - this.baseX;
      const dy = mouse.y - this.baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        
        // "Lifting" effect: move up (negative Y offset) and scale up
        // Reduced lift height as requested (from 45 to 25)
        const lift = force * 25; 
        const targetX = this.baseX;
        const targetY = this.baseY - lift;

        // Smoothly move towards the lifted target position
        this.x += (targetX - this.x) * 0.25;
        this.y += (targetY - this.y) * 0.25;
        
        // Increase size and set a visible color (Indigo instead of White)
        this.size = this.baseSize * (1 + force * 1.5);
        this.opacity = Math.min(1, this.baseOpacity + force * 0.8);
        this.color = "#4f46e5"; // Visible Indigo 600
      } else {
        // Return to base position with easing
        this.x += (this.baseX - this.x) * 0.15;
        this.y += (this.baseY - this.y) * 0.15;
        
        this.size += (this.baseSize - this.size) * 0.15;
        this.opacity = Math.max(this.baseOpacity, this.opacity - 0.02);
        this.color = this.baseColor;
      }
    } else {
      // Natural return if mouse is null
      this.x += (this.baseX - this.x) * 0.1;
      this.y += (this.baseY - this.y) * 0.1;
      this.size += (this.baseSize - this.size) * 0.1;
      this.opacity = Math.max(this.baseOpacity, this.opacity - 0.01);
      this.color = this.baseColor;
    }
  }
}

export default function IndonesiaMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { stats } = useLiveStats();
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: null as number | null, y: null as number | null, radius: 100 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  // Color palette based on activity level
  const getRegionColor = (count: number) => {
    if (count > 250) return "#312e81"; // Indigo 900
    if (count > 150) return "#3730a3"; // Indigo 800
    if (count > 80) return "#1e293b";  // Slate 800
    return "#475569"; // Slate 600 (Darker than before)
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Use integer dimensions to avoid subpixel issues in getImageData
        const w = Math.floor(width);
        const h = Math.floor(width * 0.45);
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const spacing = 7; // Density of the dots
    const p: Particle[] = [];

    // Setup Projection
    const projection = d3.geoMercator()
      .fitSize([dimensions.width, dimensions.height], geoData as any);
    
    const pathGenerator = d3.geoPath().projection(projection);

    // Initial Masking: Draw GeoJSON to temp canvas to sample points
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = dimensions.width;
    tempCanvas.height = dimensions.height;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx) return;

    // Draw ALL features to the temp canvas, using color to encode the region
    (geoData as any).features.forEach((feature: any) => {
      const provinceName = feature.properties.Propinsi;
      const regionName = PROVINCE_TO_REGION[provinceName] || "Unknown";
      const regionIndex = REGIONS.indexOf(regionName);
      
      // Encode region index in the color (R channel)
      // +1 to distinguish from background
      tempCtx.fillStyle = `rgb(${regionIndex + 1}, 0, 0)`;
      
      const pathStr = pathGenerator(feature);
      if (pathStr) {
        const path2d = new Path2D(pathStr);
        tempCtx.fill(path2d);
      }
    });

    const imageData = tempCtx.getImageData(0, 0, dimensions.width, dimensions.height).data;
    
    // Sample points ONCE
    for (let y = 0; y < dimensions.height; y += spacing) {
      for (let x = 0; x < dimensions.width; x += spacing) {
        const index = (y * dimensions.width + x) * 4;
        const rValue = imageData[index]; // Region index + 1
        
        if (rValue > 0) {
          const regionName = REGIONS[rValue - 1] || "Unknown";
          const activityCount = stats.provinceStats[regionName] || 0;
          const color = getRegionColor(activityCount);
          p.push(new Particle(x, y, color));
        }
      }
    }

    particles.current = p;

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Global Composite mapping for "Source Over" blending
      ctx.globalCompositeOperation = "source-over";
      
      particles.current.forEach(particle => {
        particle.update(mouse.current);
        particle.draw(ctx);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouse.current.x = (e.clientX - rect.left) * scaleX;
      mouse.current.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [dimensions, stats]);

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-transparent min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Stats & Copy */}
          <div className="lg:w-1/3 space-y-8 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                <MousePointer2 size={12} className="animate-pulse" /> Precision Geo-Grid
              </div>
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                Peta Sebaran <span className="text-indigo-600 relative">
                  Interaktif
                  <svg className="absolute -bottom-2 left-0 w-full h-2 text-indigo-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q25,0 50,5 T100,5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                Visualisasi partikel real-time menggunakan koordinat geografis presisi. Rasakan interaksi dinamis saat kursor Anda menjelajahi ribuan titik data dari seluruh Indonesia.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group cursor-default">
                <Users size={20} className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-black text-slate-900">{stats.totalParticipants}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Peserta</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group cursor-default">
                <TrendingUp size={20} className="text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-black text-slate-900">{stats.provinces}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Provinsi Aktif</div>
              </div>
            </div>

            <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-200">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                   <Info size={14} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Interaction Tip</span>
               </div>
               <p className="text-xs text-indigo-100 font-medium">Bintik akan bereaksi (mengangkat & bercahaya) berdasarkan kedekatan kursor Anda.</p>
            </div>
          </div>

          {/* Right: The High-Fidelity Map */}
          <div className="lg:w-2/3 relative flex flex-col items-center" ref={containerRef}>
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50/50 blur-[100px] rounded-full pointer-events-none -z-10" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="relative w-full bg-white/40 backdrop-blur-xl border border-white rounded-[3.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full h-full cursor-none"
              />
              
              {/* Region Indicators */}
              <div className="absolute top-6 left-8 flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <MapIcon size={14} className="text-indigo-600" />
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Indonesia Particle Grid v2.0</span>
              </div>
            </motion.div>

            {/* Custom Status Bar */}
            <div className="mt-8 flex items-center gap-8 px-8 py-4 bg-slate-50 rounded-full border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Low Entry</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-300" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">High Volume</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
