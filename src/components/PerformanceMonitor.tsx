"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Gauge, Zap, ChevronRight, X } from "lucide-react";

export default function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [minFps, setMinFps] = useState(120);
  const [maxFps, setMaxFps] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rAF = useRef<number>(0);

  useEffect(() => {
    const loop = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / delta);
        setFps(currentFps);
        
        if (currentFps > 0) {
          setMinFps(prev => Math.min(prev, currentFps));
          setMaxFps(prev => Math.max(prev, currentFps));
        }
        
        frameCount.current = 0;
        lastTime.current = now;
      }
      rAF.current = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(rAF.current);
  }, []);

  if (!isVisible) return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={() => setIsVisible(true)}
      className="fixed bottom-6 left-6 z-[100] w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:bg-indigo-700 transition-colors"
    >
      <Zap size={20} />
    </motion.button>
  );

  const getStatusColor = () => {
    if (fps >= 100) return "text-emerald-400";
    if (fps >= 60) return "text-blue-400";
    if (fps >= 30) return "text-amber-400";
    return "text-rose-400";
  };

  const getStatusBg = () => {
    if (fps >= 100) return "bg-emerald-500/10 border-emerald-500/20";
    if (fps >= 60) return "bg-blue-500/10 border-blue-500/20";
    if (fps >= 30) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed bottom-6 left-6 z-[100] font-sans"
    >
      <div className={`p-1 rounded-2xl flex items-center gap-2 border shadow-2xl ${getStatusBg()} backdrop-blur-2xl transition-all duration-500`}>
        
        {/* Main Badge */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text', 'bg')} animate-pulse`} />
          <div className="flex flex-col">
            <span className={`text-xl font-black leading-none ${getStatusColor()} tabular-nums`}>
              {fps}
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Real-Time FPS
            </span>
          </div>
        </div>

        <div className="w-[1px] h-8 bg-slate-200/20 my-auto" />

        {/* Dynamic Score */}
        <div className="flex items-center gap-3 px-3">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase">Performance</span>
              <span className="text-xs font-bold text-slate-700">
                {fps >= 100 ? "Excellent" : fps >= 60 ? "Smooth" : "Optimizing"}
              </span>
           </div>
           <Zap size={18} className={getStatusColor()} />
        </div>

        {/* Toggle Expand */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"
        >
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronRight size={18} />
          </motion.div>
        </button>

        <button 
          onClick={() => setIsVisible(false)}
          className="w-8 h-10 rounded-xl hover:bg-rose-500/10 flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors mr-1"
        >
          <X size={14} />
        </button>
      </div>

      {/* Expanded Stats */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: 10 }}
            animate={{ height: "auto", opacity: 1, y: -8 }}
            exit={{ height: 0, opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 w-full overflow-hidden rounded-2xl border border-slate-200/30 bg-white/80 backdrop-blur-md p-4 space-y-3 shadow-xl"
          >
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              <span>Session History</span>
              <Activity size={10} />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[8px] font-bold text-slate-400 uppercase">Min FPS</div>
                <div className="text-lg font-black text-slate-700">{minFps}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[8px] font-bold text-slate-400 uppercase">Max FPS</div>
                <div className="text-lg font-black text-slate-700">{maxFps}</div>
              </div>
            </div>

            <div className="p-2 flex items-center gap-2 text-[10px] font-bold text-slate-500 leading-tight bg-indigo-50/50 rounded-lg">
              <Gauge size={12} className="text-indigo-400" />
              Optimal stability detected for high-refresh-rate displays.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
