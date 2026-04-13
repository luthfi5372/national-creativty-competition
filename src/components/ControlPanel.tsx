"use client";

import { useFluid } from "@/contexts/FluidContext";
// ScrollReveal not used
import { Sliders } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const controls = [
  {
    key: "viscosity" as const,
    label: "Kekentalan Cairan",
    min: 0.1,
    max: 1.0,
    step: 0.05,
  },
  {
    key: "flowSpeed" as const,
    label: "Kecepatan Alir",
    min: 0.05,
    max: 1.0,
    step: 0.05,
  },
  {
    key: "refractionDepth" as const,
    label: "Kedalaman Refraksi Kaca",
    min: 0.0,
    max: 1.0,
    step: 0.05,
  },
  {
    key: "cursorIntensity" as const,
    label: "Intensitas Distorsi Kursor",
    min: 0.0,
    max: 1.0,
    step: 0.05,
  },
];

export default function ControlPanel() {
  const { params, setParams } = useFluid();
  const [open, setOpen] = useState(false);

  const feedback = () => {
    if (params.cursorIntensity > 0.7 && params.refractionDepth > 0.5) {
      return "Efek distorsi yang dalam pada kursor diaktifkan.";
    }
    if (params.viscosity > 0.7) {
      return "Cairan bergerak lambat dan kental, seperti lava.";
    }
    if (params.flowSpeed > 0.7) {
      return "Aliran cairan sangat cepat dan dinamis.";
    }
    return "Sesuaikan parameter untuk mengubah simulasi cairan.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="glass-panel w-12 h-12 flex items-center justify-center rounded-2xl glow-cyan hover:scale-110 transition-transform duration-300"
      >
        <Sliders size={20} className="text-cyan-accent" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="glass-panel absolute bottom-16 right-0 w-80 p-6 rounded-2xl"
          >
            <h3
              className="text-sm font-bold text-cyan-accent mb-4 tracking-wide uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Kontrol Simulasi
            </h3>

            <div className="space-y-5">
              {controls.map((ctrl) => (
                <div key={ctrl.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-foreground/50 font-medium">
                      {ctrl.label}
                    </label>
                    <span className="text-xs text-cyan-accent font-mono">
                      {params[ctrl.key].toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={params[ctrl.key]}
                    onChange={(e) =>
                      setParams((prev) => ({
                        ...prev,
                        [ctrl.key]: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #22d3ee ${
                        ((params[ctrl.key] - ctrl.min) / (ctrl.max - ctrl.min)) * 100
                      }%, rgba(255,255,255,0.1) ${
                        ((params[ctrl.key] - ctrl.min) / (ctrl.max - ctrl.min)) * 100
                      }%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Feedback text */}
            <div className="mt-5 p-3 rounded-xl bg-cyan-accent/5 border border-cyan-accent/10">
              <p className="text-xs text-foreground/40 leading-relaxed">
                {feedback()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
