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

  const cards = [
    { label: "Total Participants", value: stats.totalParticipants, icon: Users, color: "bg-indigo-600", trend: "+12%" },
    { label: "Provinces Covered", value: stats.provinces, icon: MapPin, color: "bg-emerald-600", trend: "National" },
    { label: "Estimated Revenue", value: `Rp ${(stats.totalParticipants * 150000).toLocaleString()}`, icon: CreditCard, color: "bg-amber-600", trend: "Pending" },
    { label: "System Health", value: "99.9%", icon: Activity, color: "bg-rose-600", trend: "Live" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-none">Control Center</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Executive oversight and system configuration for NCC 13th.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center text-white shadow-lg`}>
                <card.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">
                <ArrowUpRight size={12} /> {card.trend}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{card.label}</div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: System Controls & Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* System Control Panel [NEW] */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                <Settings size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900">System Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Registration Toggle */}
              <div className={`p-6 rounded-[2rem] border transition-all ${settings.registrationOpen ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.registrationOpen ? "bg-emerald-500 text-white" : "bg-rose-500 text-white shadow-lg shadow-rose-200"}`}>
                    {settings.registrationOpen ? <Unlock size={18}/> : <Lock size={18}/>}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${settings.registrationOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {settings.registrationOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Global Registration</h4>
                <p className="text-[11px] text-slate-500 font-medium mb-4">Control whether new participants can sign up for competitions.</p>
                <button 
                  disabled={loadingAction}
                  onClick={() => handleToggleRegistration(!settings.registrationOpen)}
                  className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.registrationOpen ? "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"}`}
                >
                  {settings.registrationOpen ? "Close Registration" : "Open Registration"}
                </button>
              </div>

              {/* Maintenance Toggle Placeholder */}
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                    <ShieldCheck size={18}/>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stable</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1">Maintenance Mode</h4>
                <p className="text-[11px] text-slate-500 font-medium mb-4">Put the entire platform into read-only mode for updates.</p>
                <button className="w-full py-3 bg-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Registration Breakdown */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Registration Breakdown</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Real-time Analytics</span>
            </div>
            
            <div className="space-y-6">
              {Object.entries(stats.categoryBreakdown).map(([cat, count]: [string, any]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">{cat}</span>
                    <span className="text-sm font-black text-indigo-600">{count} Peserta</span>
                  </div>
                  <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.totalParticipants) * 100 || 0}%` }}
                      className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Log & Global Activity */}
        <div className="space-y-8">
          {/* Admin Audit Log [NEW] */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full max-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="text-slate-400" size={18} />
                <h3 className="text-lg font-black text-slate-900">System Logs</h3>
              </div>
              <button onClick={refreshData} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Refresh</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest truncate max-w-[120px]">{log.adminEmail.split('@')[0]}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{log.action}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {logs.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-medium italic">No recent activity logs.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-200 p-8 text-white flex flex-col justify-between overflow-hidden relative group h-[300px]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
             
             <div className="relative">
               <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                 <Globe className="text-white" size={24} />
               </div>
               <h3 className="text-2xl font-black leading-tight mb-2">Regional<br/>Expansion</h3>
               <p className="text-indigo-100 text-xs font-medium leading-relaxed">Distribution across {stats.provinces} key provinces in Indonesia.</p>
             </div>

             <div className="relative">
               <div className="flex -space-x-3 mb-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-4 border-indigo-600 bg-indigo-400" />
                 ))}
                 <div className="w-10 h-10 rounded-full border-4 border-indigo-600 bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-black">+{stats.totalParticipants}</div>
               </div>
               <button className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-900/20">
                 Insights Engine
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
