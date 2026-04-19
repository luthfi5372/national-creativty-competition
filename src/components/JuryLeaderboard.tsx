"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Medal, 
  Award, 
  Search, 
  Filter, 
  BarChart3,
  ChevronRight,
  TrendingUp,
  School,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminFetchAllScores } from "@/lib/supabase/service";

const CATEGORIES = ["SEMUA", "Olimpiade MIPA", "Speech Contest", "LKTI Nasional", "MTQ Nasional"];

export default function JuryLeaderboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");

  useEffect(() => {
    loadScores();
  }, []);

  async function loadScores() {
    setIsLoading(true);
    const { data } = await adminFetchAllScores();
    if (data) setScores(data);
    setIsLoading(false);
  }

  // Aggregate scores: Calculated average if multiple judges score the same entry
  const leaderboardData = useMemo(() => {
    const entryMap: Record<string, any> = {};

    scores.forEach(s => {
      const eid = s.entry_id;
      if (!entryMap[eid]) {
        entryMap[eid] = {
          id: eid,
          name: s.competition_entries.full_name,
          school: s.competition_entries.school,
          category: s.competition_entries.category,
          totalPoints: 0,
          judgesCount: 0,
        };
      }
      entryMap[eid].totalPoints += parseFloat(s.total_score);
      entryMap[eid].judgesCount += 1;
    });

    const list = Object.values(entryMap).map((e: any) => ({
      ...e,
      finalScore: (e.totalPoints / e.judgesCount).toFixed(2)
    }));

    // Filter by category
    const filtered = selectedCategory === "SEMUA" 
      ? list 
      : list.filter(e => e.category === selectedCategory);

    // Sort by score
    return filtered.sort((a: any, b: any) => parseFloat(b.finalScore) - parseFloat(a.finalScore));
  }, [scores, selectedCategory]);

  return (
    <div className="space-y-8 font-inter">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === cat 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight leading-none uppercase">Live Leaderboard</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">Calculated Average of Jury Scores</p>
            </div>
          </div>
          <button 
            onClick={loadScores}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
          >
            <TrendingUp size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Rank</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Participant</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Institusi</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Kategori</th>
                <th className="px-8 py-6 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Final Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-indigo-400 font-bold animate-pulse">SYNCHRONIZING JURY DATA...</td></tr>
                ) : leaderboardData.length > 0 ? (
                  leaderboardData.map((e: any, idx: number) => (
                    <motion.tr 
                      key={e.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                          idx === 0 ? "bg-amber-500/20 text-amber-500" :
                          idx === 1 ? "bg-slate-300/20 text-slate-300" :
                          idx === 2 ? "bg-orange-500/20 text-orange-400" :
                          "bg-white/5 text-white/40"
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{e.name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase">
                          <School size={14} className="text-indigo-500" />
                          {e.school}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-black text-white/60 uppercase tracking-tighter border border-white/5">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-lg font-black text-white tabular-nums">{e.finalScore}</span>
                           <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{e.judgesCount} Judge(s)</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-20 text-center text-white/20 font-black uppercase tracking-widest text-xs">Belum ada nilai yang masuk</td></tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
