"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Rocket } from "lucide-react";

export default function WelcomeOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Periksa apakah user sudah melihat welcome screen di sesi ini
    const hasSeenWelcome = sessionStorage.getItem("ncc_welcome_seen");
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
      // Simpan status agar tidak muncul lagi di sesi yang sama
      sessionStorage.setItem("ncc_welcome_seen", "true");
      
      // Auto-hide setelah 4 detik
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.1, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative max-w-lg w-full bg-white/10 border border-white/20 rounded-[3rem] p-12 text-center shadow-2xl overflow-hidden"
          >
            {/* Animasi Cahaya di Belakang */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 pointer-events-none"></div>
            
            <div className="relative z-10">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20 border border-white/20"
              >
                <ShieldCheck size={48} className="text-white" />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-black text-white mb-4 tracking-tight"
              >
                Misi Dimulai!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-blue-100 text-lg font-medium leading-relaxed"
              >
                Selamat datang di <span className="text-white font-bold">NCC 13th Command Center</span>. Siapkan karya terbaikmu dan jadilah juara masa depan!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="mt-10"
              >
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Rocket size={18} />
                  Masuk Markas Besar
                </button>
              </motion.div>
            </div>

            {/* Partikel Sparkle Dekoratif */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 right-10 text-white/40"
            >
              <Sparkles size={24} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
