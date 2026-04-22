"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  Search, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Medal,
  Activity,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { fetchPublicLeaderboard } from "@/lib/supabase/service";

const CATEGORIES = [
  "SEMUA",
  "Olimpiade MIPA",
  "Speech Contest",
  "LKTI Nasional",
  "MTQ Nasional"
];

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLeaderboard();
    // Poll for updates every 30 seconds for that "Live" feel
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadLeaderboard() {
    // We only show loading on first load
    const { data: leaderboardData } = await fetchPublicLeaderboard();
    if (leaderboardData) {
      setData(leaderboardData);
    }
    setIsLoading(false);
  }

  const filteredData = data
    .filter(item => selectedCategory === "SEMUA" || item.category === selectedCategory)
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.school.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-violet-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Navbar Header */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-500 shadow-xl">
              <ArrowLeft className="text-white/60 group-hover:text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">NCC <span className="text-indigo-400">LIVE</span> LEADERBOARD</h1>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-1.5">Official Scoring System 13th</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   System Online
                </span>
                <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em]">Real-time Sync Active</span>
             </div>
             <div className="w-px h-8 bg-white/10 hidden lg:block mr-4" />
             <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 p-0.5">
                <div className="w-full h-full rounded-full bg-indigo-500/20 flex items-center justify-center">
                   <Activity size={18} className="text-indigo-400 animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Trophy size={14} className="text-amber-400" /> Tahap Penilaian Final
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85]"
          >
            PAPAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 italic">SKOR.</span>
          </motion.h1>
          
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-white/40 max-w-2xl mx-auto font-medium text-lg leading-relaxed"
          >
            Panggung bagi para juara. Pantau pergerakan nilai secara langsung dari meja juri nasional NCC 13th.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
           <div className="flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    selectedCategory === cat 
                      ? "bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] scale-105" 
                      : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>

           <div className="relative group w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Cari Nama / Sekolah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/5 hover:border-white/10 focus:border-indigo-500/50 outline-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-medium w-full md:w-80 transition-all placeholder:text-white/10"
              />
           </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-4">
           {isLoading ? (
             [...Array(5)].map((_, i) => (
               <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
             ))
           ) : filteredData.length > 0 ? (
             <AnimatePresence mode="popLayout">
               {filteredData.map((item, idx) => (
                 <motion.div
                   key={item.id}
                   layout
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.5, delay: idx * 0.05 }}
                   className="group relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 rounded-3xl p-6 transition-all duration-500 flex items-center justify-between"
                 >
                   <div className="flex items-center gap-8">
                      {/* Rank Number */}
                      <div className="flex flex-col items-center justify-center w-12">
                         {idx < 3 && selectedCategory !== "SEMUA" ? (
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                             idx === 0 ? "bg-amber-400/20 text-amber-400 border border-amber-400/30" : 
                             idx === 1 ? "bg-slate-300/20 text-slate-300 border border-slate-300/30" : 
                             "bg-orange-400/20 text-orange-400 border border-orange-400/30"
                           }`}>
                             <Medal size={20} />
                           </div>
                         ) : (
                           <span className="text-2xl font-black text-white/20 tabular-nums">#{idx + 1}</span>
                         )}
                      </div>

                      {/* Participant Info */}
                      <div>
                         <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold tracking-tight uppercase group-hover:text-indigo-400 transition-colors">
                              {item.name}
                            </h3>
                            <div className="px-2 py-0.5 rounded bg-indigo-500/10 text-[8px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/10">
                               {item.category}
                            </div>
                         </div>
                         <p className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={14} className="text-indigo-500" /> {item.school}
                         </p>
                      </div>
                   </div>

                   {/* Score */}
                   <div className="text-right">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Total Skor</p>
                      <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tabular-nums leading-none">
                         {item.score}
                      </div>
                   </div>

                   {/* Glass Effect */}
                   <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                 </motion.div>
               ))}
             </AnimatePresence>
           ) : (
             <div className="py-32 text-center bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Clock className="text-white/20" size={32} />
                </div>
                <h4 className="text-lg font-black text-white/20 uppercase tracking-widest">Belum Ada Data Skor</h4>
                <p className="text-white/10 text-xs mt-2 uppercase tracking-widest">Hasil akan muncul setelah juri memberikan penilaian.</p>
             </div>
           )}
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center mt-20 relative z-10">
         <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp size={16} className="text-indigo-500" />
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">NCC 13th Live Leaderboard Protocol</p>
         </div>
         <p className="text-white/10 text-[9px] uppercase tracking-[0.2em]">Semua nilai yang ditampilkan adalah hasil verifikasi tim juri resmi.</p>
      </footer>
    </div>
  );
}
