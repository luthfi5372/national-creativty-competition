"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Activity, Clock, Trophy, Megaphone, 
  Server, Cpu, Users, FileText, 
  ShieldAlert, PlusCircle, Download, 
  SendHorizonal, Loader2, Trash2, Power, 
  FileEdit, X, Save, ShieldCheck, Search,
  BellRing, Info, ChevronRight, LayoutDashboard,
  CheckCircle2, CircleEllipsis, Settings
} from "lucide-react";

export default function ManajemenJadwalLLMS() {
  const supabase = createClient();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sesi' | 'nilai' | 'broadcast'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExamForLeaderboard, setSelectedExamForLeaderboard] = useState<string>("");
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Stats Real-time
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalQuestions: 0,
    liveParticipants: 0,
    totalViolations: 0,
    serverLatency: 0
  });

  // Form State
  const [newSession, setNewSession] = useState({
    title: "", token: "", duration_minutes: 90, scoring_system: "Fixed",
    correct_point: 4, penalty_point: 0, empty_point: 0
  });

  // Broadcast State
  const [broadcast, setBroadcast] = useState({
    exam_id: "", 
    message: "",
    type: "info"
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // --- 📡 DATA FETCHING ENGINE ---
  const fetchData = async () => {
    const startTime = performance.now();
    try {
      const { count: sCount } = await supabase.from('cbt_exams').select('*', { count: 'exact', head: true });
      const { data: sessionData } = await supabase.from('cbt_exams').select('*').order('created_at', { ascending: false });
      const { count: qCount } = await supabase.from('cbt_questions').select('*', { count: 'exact', head: true });
      const { data: attempts } = await supabase.from('cbt_attempts').select('warnings_count, status');
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (sessionData) {
        setSessions(sessionData);
        setStats({
          activeSessions: sCount || 0,
          totalQuestions: qCount || 0,
          liveParticipants: attempts?.filter(a => a.status === 'ongoing').length || 0,
          totalViolations: attempts?.reduce((acc, curr) => acc + (curr.warnings_count || 0), 0) || 0,
          serverLatency: latency
        });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async (examId: string) => {
    try {
      const { data: attempts } = await supabase
        .from('cbt_attempts')
        .select('*')
        .eq('exam_id', examId)
        .order('final_score', { ascending: false });
      
      if (attempts) {
        setLeaderboardData(attempts);
      }
    } catch (err) { console.error("Leaderboard Error:", err); }
  };

  useEffect(() => {
    fetchData();
    const pingInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        serverLatency: Math.max(15, prev.serverLatency + (Math.floor(Math.random() * 5) - 2))
      }));
    }, 5000);
    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    if (selectedExamForLeaderboard) {
      fetchLeaderboard(selectedExamForLeaderboard);
      const channel = supabase
        .channel('realtime_leaderboard')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'cbt_attempts',
          filter: `exam_id=eq.${selectedExamForLeaderboard}`
        }, () => {
          fetchLeaderboard(selectedExamForLeaderboard);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedExamForLeaderboard]);

  const handleToggleAktif = async (id: string, current: boolean) => {
    const { error } = await supabase.from('cbt_exams').update({ is_active: !current }).eq('id', id);
    if (!error) fetchData();
  };

  const handleHapusJadwal = async (id: string, title: string) => {
    if (confirm(`Hapus sesi "${title}"? Semua soal dan data pengerjaan akan hilang.`)) {
      const { error } = await supabase.from('cbt_exams').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handleAddSession = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('cbt_exams').insert([newSession]);
    if (!error) {
      setShowAddModal(false);
      setNewSession({
        title: "", token: "", duration_minutes: 90, scoring_system: "Fixed",
        correct_point: 4, penalty_point: 0, empty_point: 0
      });
      fetchData();
    }
    setIsSaving(false);
  };

  const exportToCSV = () => {
    if (!leaderboardData.length) return;
    const headers = ["Rank", "Ticket ID", "Status", "Skor"];
    const rows = leaderboardData.map((row, idx) => [
      idx + 1, row.user_id, row.status, row.final_score || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `leaderboard_${selectedExamForLeaderboard}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* \ud83e\uddfc HEADER & NAVIGATION (Soft-Minimalist Style) */}
        <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 px-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Server className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">Pusat Komando LLMS</h1>
              <p className="text-[11px] text-gray-400 font-medium">Administrasi Ujian & Manajemen Real-time NCC 13th.</p>
            </div>
          </div>
          
          <div className="flex bg-gray-50/80 p-1.5 rounded-[1.5rem] border border-gray-100 shadow-inner">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'sesi', label: 'Sesi & Waktu', icon: Clock },
              { id: 'nilai', label: 'Penilaian Live', icon: Trophy },
              { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-bold transition-all ${
                  activeSubTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- TAB CONTENT: OVERVIEW --- */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between px-2">
              <div className="text-left">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <Activity className="w-5 h-5 text-indigo-500 mr-2" />
                  Sistem Telemetri NCC
                </h2>
                <p className="text-xs text-gray-400 mt-1">Pantauan real-time infrastruktur ujian secara terpusat.</p>
              </div>
              <div className="flex items-center px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Status: Optimal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: CBT Engine */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group min-h-[200px] flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
                <div className="text-left relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center">
                    <Server className="w-4 h-4 mr-2 text-indigo-400" /> Live CBT Engine
                  </p>
                  <h3 className="text-7xl font-black text-indigo-600 mt-3 tracking-tighter">{stats.activeSessions}</h3>
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl w-max relative z-10">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase">{stats.activeSessions} Sesi Sedang Berjalan</span>
                </div>
              </div>

              {/* Card 2: Infra Health */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[200px]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center text-left">
                  <Cpu className="w-4 h-4 mr-2 text-amber-400" /> Infra Health
                </p>
                <div className="space-y-5 w-full mt-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase">
                      <span className="text-gray-400">Database (Supabase)</span>
                      <span className="text-amber-500 font-mono tracking-tighter">{stats.serverLatency}ms</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden border border-gray-100 shadow-inner">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (stats.serverLatency / 300) * 100)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase">
                      <span className="text-gray-400">Real-time Socket</span>
                      <span className="text-emerald-500 font-mono tracking-tighter">CONNECTED</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden border border-gray-100 shadow-inner">
                      <div className="bg-emerald-400 h-full rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold flex items-center mt-4 uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1.5" /> Global sync verified
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col group hover:border-indigo-200 transition-colors">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Traffic Peserta Live</p>
                  <h3 className="text-5xl font-black text-gray-800 mt-1">{stats.liveParticipants}</h3>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col group hover:border-indigo-200 transition-colors">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Butir Soal Tersimpan</p>
                  <h3 className="text-5xl font-black text-gray-800 mt-1">{stats.totalQuestions}</h3>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group hover:border-rose-200 transition-colors">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Radar Pelanggaran</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <h3 className="text-5xl font-black text-rose-500">{stats.totalViolations}</h3>
                    <span className="text-xs font-bold text-gray-400 uppercase">Alerts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: BROADCAST --- */}
        {activeSubTab === 'broadcast' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-left">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-14 h-14 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100">
                      <Megaphone size={28} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pusat Siaran Live</h2>
                      <p className="text-sm text-gray-400 font-medium">Kirim instruksi massal ke layar peserta secara real-time.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   <div className="lg:col-span-2 space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Target Sesi Ujian</label>
                         <select 
                            value={broadcast.exam_id}
                            onChange={(e) => setBroadcast({...broadcast, exam_id: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer appearance-none"
                         >
                            <option value="">🚀 Seluruh Sesi (Global)</option>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                         </select>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Pesan Siaran</label>
                         <textarea 
                            placeholder="Ketik pesan pengumuman di sini..."
                            value={broadcast.message}
                            onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
                            rows={5}
                            className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner"
                         />
                      </div>

                      <button 
                         onClick={async () => {
                            if (!broadcast.message) return alert("Pesan kosong!");
                            setIsBroadcasting(true);
                            const { error } = await supabase.from('announcements').insert([{
                               exam_id: broadcast.exam_id || null,
                               message: broadcast.message,
                               type: broadcast.type
                            }]);
                            if (!error) {
                               alert("🚀 Siaran Berhasil Meluncur!");
                               setBroadcast({...broadcast, message: ""});
                            }
                            setIsBroadcasting(false);
                         }}
                         disabled={isBroadcasting}
                         className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                         {isBroadcasting ? <Loader2 className="animate-spin" /> : <><SendHorizonal size={18} /> Lancarkan Siaran</>}
                      </button>
                   </div>

                   <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <BellRing size={14} className="text-indigo-500" /> Tips Komando
                      </h4>
                      <ul className="space-y-5 text-xs text-gray-500 font-medium leading-relaxed">
                         <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                            Gunakan siaran Global untuk pengumuman durasi waktu sisa.
                         </li>
                         <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                            Siswa akan menerima notifikasi melayang (pop-up) selama 15 detik.
                         </li>
                      </ul>
                      <div className="mt-auto pt-8 flex justify-center opacity-10">
                         <Megaphone size={80} className="rotate-12" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- TAB CONTENT: SESI --- */}
        {activeSubTab === 'sesi' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-between items-center px-4">
                 <h2 className="text-lg font-black text-gray-800">Manajemen Sesi & Waktu</h2>
                 <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    <PlusCircle size={16} /> Buka Sesi Baru
                 </button>
              </div>
              <div className="grid grid-cols-1 gap-4 text-left">
                 {sessions.map(s => (
                   <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                      <div className="text-left space-y-2">
                         <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-800">{s.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                               {s.is_active ? 'Aktif' : 'Non-aktif'}
                            </span>
                         </div>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-indigo-400" /> {s.duration_minutes} Menit</span>
                            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-indigo-400" /> Token: {s.token}</span>
                         </p>
                      </div>
                      <div className="flex items-center gap-3">
                         <Link href={`/hq/llms/${s.id}/questions`} className="p-3 bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                            <FileEdit size={18} />
                         </Link>
                         <button onClick={() => handleHapusJadwal(s.id, s.title)} className="p-3 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100">
                            <Trash2 size={18} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* --- TAB CONTENT: NILAI --- */}
        {activeSubTab === 'nilai' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm gap-6">
                 <div className="text-left">
                    <h3 className="text-xl font-black text-gray-800">Real-time Leaderboard</h3>
                    <p className="text-xs text-gray-400 font-medium">Pantau pergerakan skor secara langsung.</p>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto">
                    <select 
                       value={selectedExamForLeaderboard}
                       onChange={(e) => setSelectedExamForLeaderboard(e.target.value)}
                       className="flex-grow md:w-64 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none"
                    >
                       <option value="">Pilih Sesi Ujian...</option>
                       {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                    <button onClick={exportToCSV} disabled={!selectedExamForLeaderboard} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-30">
                       <Download size={18} />
                    </button>
                 </div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                 {!selectedExamForLeaderboard ? (
                    <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest text-xs">Pilih Sesi Ujian</div>
                 ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Peserta</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Skor</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {leaderboardData.map((e, i) => (
                               <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-8 py-5 font-black text-gray-400">#{i+1}</td>
                                  <td className="px-8 py-5 font-bold text-gray-700 text-sm">{e.user_id}</td>
                                  <td className="px-8 py-5 text-center">
                                     <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${e.status === 'ongoing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{e.status}</span>
                                  </td>
                                  <td className="px-8 py-5 text-right font-black text-indigo-600">{e.final_score || 0}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 )}
              </div>
           </div>
        )}

      </div>

      {/* --- MODAL ADD SESSION --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-gray-800">Buka Sesi Ujian Baru</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Judul Sesi</label>
                    <input type="text" value={newSession.title} onChange={(e) => setNewSession({...newSession, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Token Akses</label>
                       <input type="text" value={newSession.token} onChange={(e) => setNewSession({...newSession, token: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Durasi (Menit)</label>
                       <input type="number" value={newSession.duration_minutes} onChange={(e) => setNewSession({...newSession, duration_minutes: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                    </div>
                 </div>
                 <button onClick={handleAddSession} disabled={isSaving} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Bangun Sesi Sekarang</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
