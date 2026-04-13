"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Map as MapIcon, 
  School, 
  Target, 
  ArrowUpRight,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { getAllCompetitionEntries } from "@/lib/localAuth";

export default function AdminInsights() {
  const [entries, setEntries] = useState<any[]>([]);
  const [cityStats, setCityStats] = useState<any[]>([]);
  const [schoolStats, setSchoolStats] = useState<any[]>([]);

  useEffect(() => {
    const data = getAllCompetitionEntries();
    setEntries(data);

    // Process City Stats
    const cities: Record<string, number> = {};
    const schools: Record<string, number> = {};
    
    data.forEach(e => {
      cities[e.city] = (cities[e.city] || 0) + 1;
      schools[e.school] = (schools[e.school] || 0) + 1;
    });

    setCityStats(Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 10));
    setSchoolStats(Object.entries(schools).sort((a, b) => b[1] - a[1]).slice(0, 10));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Regional Insights</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Deep-dive analysis of participation across cities and schools.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Cities */}
        <div className="lg:col-span-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BarChart3 size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Top Cities</h3>
            </div>
            
            <div className="space-y-6">
                {cityStats.map(([city, count], idx) => (
                    <div key={city} className="group cursor-default">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-slate-700">{city}</span>
                            <span className="text-sm font-black text-indigo-600">{count}</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / entries.length) * 100 || 0}%` }}
                                className="h-full bg-indigo-600 rounded-full"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Top Schools */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <School size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">High-Performance Schools</h3>
                </div>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {schoolStats.map(([school, count], idx) => (
                    <div key={school} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="text-xs font-black text-slate-300">#{idx + 1}</div>
                            <div>
                                <div className="text-sm font-black text-slate-900 truncate max-w-[150px]">{school}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{count} Registered</div>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Exclusive "Owner" Metrics Card */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-slate-900 rounded-[3rem] text-white flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                <Target className="text-indigo-400 mb-6" size={32} />
                <div>
                    <h4 className="text-lg font-black mb-2">Target Conversion</h4>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                        92% of users who start the form complete it. This is 15% higher than previous years.
                    </p>
                </div>
            </div>
            
            <div className="p-8 bg-indigo-500 rounded-[3rem] text-white flex flex-col justify-between group overflow-hidden relative">
                <MapIcon className="text-white/60 mb-6" size={32} />
                <div>
                    <h4 className="text-lg font-black mb-2">Regional Leader</h4>
                    <p className="text-white/80 text-xs font-medium leading-relaxed">
                        Jawa Tengah continues to be our primary growth engine with 40% of all registrations.
                    </p>
                </div>
            </div>

            <div className="p-8 bg-card rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-indigo-400 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all mb-4">
                    <Plus size={24} />
                </div>
                <h4 className="text-sm font-black text-slate-900">Add New Insight Widget</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure Dashboard</p>
            </div>
        </div>

      </div>
    </div>
  );
}
