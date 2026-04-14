"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  MapPin, 
  CreditCard, 
  ArrowUpRight, 
  Activity,
  Calendar,
  Globe,
  Settings,
  ShieldCheck,
  History,
  Lock,
  Unlock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getGlobalStats, 
  getSystemSettings, 
  setRegistrationStatus, 
  getAdminLogs, 
  AdminLog, 
  SystemSettings 
} from "@/lib/localAuth";

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const s = await getGlobalStats();
    setStats(s);
    setSettings(getSystemSettings());
    setLogs(getAdminLogs());
  };

  const handleToggleRegistration = (isOpen: boolean) => {
    setLoadingAction(true);
    const res = setRegistrationStatus(isOpen);
    if (res.success) {
      refreshData();
    }
    setLoadingAction(false);
  };

  if (!stats || !settings) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Vercel-style Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">national-creativity-competition</span>
          <span className="text-white/20">/</span>
          <span className="text-white px-2 py-0.5 bg-white/10 rounded-md">admin-control-center</span>
        </div>
        
        {/* Section Tabs (Vercel Style) */}
        <div className="flex items-center gap-6 border-b border-white/10 pb-px">
          {["Deployment", "Logs", "Resources", "Source", "Open Graph"].map((tab, i) => (
            <button 
              key={tab}
              className={`pb-3 text-[13px] font-medium transition-colors relative ${i === 0 ? "text-white" : "text-slate-500 hover:text-white"}`}
            >
              {tab}
              {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white translate-y-px" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Deployment Card (Vercel Style) */}
      <div className="bg-[#000] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
           <h2 className="text-sm font-bold text-white">System Details</h2>
           <div className="flex gap-2">
             <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-bold text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2">
               <History size={12} /> View Logs
             </button>
             <button className="px-3 py-1.5 bg-white text-black rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-all">
               Refresh State
             </button>
           </div>
        </div>

        <div className="p-8 flex flex-col lg:flex-row gap-12">
          {/* Visual Preview Placeholder */}
          <div className="lg:w-1/3 aspect-video bg-indigo-900/20 rounded-xl border border-indigo-500/20 flex flex-col items-center justify-center relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
             <div className="relative z-10 flex flex-col items-center">
               <ShieldCheck size={48} className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-500" />
               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">NCC 13th Live Dashboard</p>
             </div>
          </div>

          {/* Details Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Created</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20" />
                <p className="text-[13px] font-bold text-white">system-admin <span className="text-slate-500 font-medium ml-2">2h ago</span></p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <p className="text-[13px] font-bold text-white">Ready <span className="text-slate-500 font-medium ml-2">Verified</span></p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Domain</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 text-[13px] font-bold cursor-pointer hover:underline">
                   <Globe size={13} />
                   <span>ncc-monitoring-prod.vercel.app</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[13px] font-medium cursor-pointer hover:text-white transition-colors">
                   <Globe size={13} />
                   <span>ncc-admin-control.vercel.app</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Source</p>
              <div className="flex items-center gap-2 text-indigo-400 text-[13px] font-bold cursor-pointer hover:underline">
                 <Lock size={13} />
                 <span>production-deploy</span>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-2">b909c72: chore: professional cleanup...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Breakdown (Matching Vercel Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Participants Breakdown */}
        <div className="bg-[#000] border border-white/10 rounded-xl p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
               <Users size={18} className="text-slate-400" />
               <h3 className="text-sm font-bold text-white">Registration Analytics</h3>
             </div>
             <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Live Sync</span>
          </div>
          
          <div className="space-y-5">
            {Object.entries(stats.categoryBreakdown).map(([cat, count]: [string, any]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[12px] font-bold text-slate-300">{cat}</span>
                  <span className="text-[12px] font-black text-white">{count} Entry</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / (stats.totalParticipants || 1)) * 100 || 0}%` }}
                    className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Configuration (Vercel Settings Style) */}
        <div className="bg-[#000] border border-white/10 rounded-xl p-8 space-y-6">
           <div className="flex items-center gap-3 mb-4">
             <Settings size={18} className="text-slate-400" />
             <h3 className="text-sm font-bold text-white">System Configuration</h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Public Registration</p>
                  <p className="text-[11px] text-slate-500 font-medium">Allow new competition entries via website.</p>
                </div>
                <button 
                  onClick={() => handleToggleRegistration(!settings.registrationOpen)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${settings.registrationOpen ? "bg-white text-black hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                >
                  {settings.registrationOpen ? "Disable" : "Enable"}
                </button>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-500 font-medium">Redirect users to safety during updates.</p>
                </div>
                <div className="px-4 py-2 bg-white/10 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  OFF
                </div>
              </div>
           </div>

           <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Activity size={12} className="text-emerald-500" />
                Latest Audit: {logs[0]?.action || "No recent activity"}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
