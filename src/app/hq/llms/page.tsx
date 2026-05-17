"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Server, Users, FileText, ShieldAlert, 
  Megaphone, Trophy, Play, Plus, 
  ChevronRight, Download, Loader2, X, Save,
  Activity, Clock, Search, Bell, History, RotateCcw,
  ArrowLeft, Key, Monitor, ShieldCheck, AlertTriangle, FileDown
} from "lucide-react";

export default function DashboardOverview() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 📊 Live KPIs
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalQuestions: 0,
    liveParticipants: 0,
    totalViolations: 0
  });

  // 📝 New Session State
  const [newSession, setNewSession] = useState({
    title: "", token: "", duration_minutes: 90, scoring_system: "Fixed",
    correct_point: 4, penalty_point: 0, empty_point: 0
  });

  // 🕒 State untuk Rolling Token & Security Log
  const [countdown, setCountdown] = useState(0);
  const [liveTokens, setLiveTokens] = useState<Record<string, string>>({});
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

  // --- 📡 DATA ENGINE ---
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: sessionData } = await supabase.from('cbt_exams').select('*').order('created_at', { ascending: false });
      const { count: qCount } = await supabase.from('cbt_questions').select('*', { count: 'exact', head: true });
      const { data: attempts } = await supabase.from('cbt_attempts').select('warnings_count, status, user_id, updated_at, submitted_at').order('updated_at', { ascending: false });

      let onlineCount = 0;
      let violationSum = 0;
      let logs: any[] = [];

      if (attempts) {
        attempts.forEach((attempt) => {
          if (!attempt.submitted_at) onlineCount++;
          violationSum += attempt.warnings_count || 0;
          
          // Memasukkan data peserta yang curang ke dalam log
          if (attempt.warnings_count > 0) {
            logs.push({
              id: attempt.user_id + attempt.updated_at,
              userId: attempt.user_id,
              count: attempt.warnings_count,
              time: new Date(attempt.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        });
      }

      // Ambil 3 kejadian terbaru saja untuk ditampilkan di log samping
      setSecurityLogs(logs.slice(0, 3));

      if (sessionData) {
        setSessions(sessionData);
        setStats({
          activeSessions: sessionData.filter(s => s.is_active).length,
          totalQuestions: qCount || 0,
          liveParticipants: onlineCount,
          totalViolations: violationSum
        });
      }
    } catch (err) { console.error(err); } finally { 
      setIsLoading(false); 
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // MESIN PENGHITUNG WAKTU TOKEN (Setiap 10 Menit = 600 Detik)
  useEffect(() => {
    const updateTimerAndTokens = () => {
      const now = Math.floor(Date.now() / 1000);
      const interval10Min = 600; 
      const currentInterval = Math.floor(now / interval10Min);
      const secondsLeft = interval10Min - (now % interval10Min);
      
      setCountdown(secondsLeft);

      // Buat token acak deterministik berdasarkan ID sesi dan waktu saat ini
      const newTokens: Record<string, string> = {};
      sessions.forEach(s => {
        const charPool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
        let token = "";
        let seed = (s.id.charCodeAt(0) + currentInterval) % 10000;
        for(let i=0; i<6; i++) {
           seed = (seed * 9301 + 49297) % 233280;
           token += charPool[Math.floor((seed / 233280) * charPool.length)];
        }
        newTokens[s.id] = token;
      });
      setLiveTokens(newTokens);
    };

    updateTimerAndTokens(); 
    const timer = setInterval(updateTimerAndTokens, 1000);
    return () => clearInterval(timer);
  }, [sessions]);

  // Format detik ke MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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

  // FUNGSI UNDUH LOG KECURANGAN (CSV)
  const downloadSecurityReport = () => {
    const headers = ['Waktu', 'ID Peserta', 'Jumlah Pelanggaran Keluar Layar'];
    const csvRows = securityLogs.map(log => `${log.time},${log.userId},${log.count}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Kecurangan_NCC13_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8 font-sans select-none text-gray-800 text-left overflow-x-hidden">
      {/* 🧬 INJEKSI CUSTOM CSS UNTUK ANIMASI STAGGERED */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stagger-1 { animation: fadeUp 0.5s ease-out 0.1s forwards; opacity: 0; }
        .animate-stagger-2 { animation: fadeUp 0.5s ease-out 0.2s forwards; opacity: 0; }
        .animate-stagger-3 { animation: fadeUp 0.5s ease-out 0.3s forwards; opacity: 0; }
        .animate-stagger-4 { animation: fadeUp 0.5s ease-out 0.4s forwards; opacity: 0; }
      `}} />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 🧼 HEADER UTAMA */}
        <div className="animate-stagger-1 bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 px-2">
            <Link href="/hq" className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors border border-gray-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-[#5145cd] text-white rounded-xl flex items-center justify-center shadow-md">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">Pusat Komando LLMS</h1>
              <p className="text-xs text-gray-500 font-bold mt-0.5">ADMINISTRASI TERPUSAT NCC 13TH</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-100 border-2 border-emerald-200 rounded-xl flex items-center shadow-sm">
             <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2 border border-emerald-600"></span>
             <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Sistem Online</span>
          </div>
        </div>

        {/* 📊 METRIK KPI DENGAN KONTRAS TINGGI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="animate-stagger-2 bg-white p-5 rounded-2xl border-2 border-blue-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1.5 h-full bg-blue-500"></div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Peserta Online</p>
              <h3 className="text-4xl font-black mt-1 text-blue-600">
                {refreshing ? <Loader2 className="w-6 h-6 animate-spin text-blue-300" /> : stats.liveParticipants}
              </h3>
            </div>
            <Users className="w-10 h-10 text-blue-200 group-hover:text-blue-500 transition-colors" />
          </div>

          {/* Card 2 */}
          <div className="animate-stagger-2 bg-white p-5 rounded-2xl border-2 border-indigo-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1.5 h-full bg-[#5145cd]"></div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sesi Aktif</p>
              <h3 className="text-4xl font-black mt-1 text-[#5145cd]">
                {refreshing ? <Loader2 className="w-6 h-6 animate-spin text-indigo-300" /> : stats.activeSessions}
              </h3>
            </div>
            <Play className="w-10 h-10 text-indigo-200 group-hover:text-[#5145cd] transition-colors" />
          </div>

          {/* Card 3 */}
          <div className="animate-stagger-2 bg-white p-5 rounded-2xl border-2 border-teal-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute left-0 top-0 w-1.5 h-full bg-teal-500"></div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bank Soal</p>
              <h3 className="text-4xl font-black mt-1 text-teal-600">
                {refreshing ? <Loader2 className="w-6 h-6 animate-spin text-teal-300" /> : stats.totalQuestions}
              </h3>
            </div>
            <FileText className="w-10 h-10 text-teal-200 group-hover:text-teal-500 transition-colors" />
          </div>

          {/* Card 4 */}
          <div className="animate-stagger-2 bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-sm flex items-center justify-between relative overflow-hidden group bg-rose-50/30">
            <div className={`absolute left-0 top-0 w-1.5 h-full ${stats.totalViolations > 0 ? 'bg-rose-500 animate-pulse' : 'bg-rose-300'}`}></div>
            <div>
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Kecurangan</p>
              <h3 className="text-4xl font-black mt-1 text-rose-600">
                {refreshing ? <Loader2 className="w-6 h-6 animate-spin text-rose-300" /> : stats.totalViolations}
              </h3>
            </div>
            <ShieldAlert className="w-10 h-10 text-rose-300 group-hover:text-rose-500 transition-colors" />
          </div>
        </div>

        {/* 🏢 LAYOUT BAWAH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TABEL SESI DENGAN PEMBATAS TEGAS */}
          <div className="animate-stagger-3 lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 shadow-sm flex flex-col min-h-[400px]">
            <div className="p-5 flex justify-between items-center bg-gray-50 border-b-2 border-gray-200 rounded-t-xl">
              <h2 className="text-base font-black text-gray-800">Daftar Sesi & Live Monitoring</h2>
              <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#5145cd] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#4035a8] transition-colors border border-[#372b9c] shadow-sm flex items-center">
                <Plus className="w-3 h-3 mr-1" /> Buat Sesi
              </button>
            </div>
            
            <div className="p-0 overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest border-b-2 border-gray-200">
                    <th className="py-4 px-5 font-black">Informasi Sesi</th>
                    <th className="py-4 px-5 font-black text-center">Live Token (10 Menit)</th>
                    <th className="py-4 px-5 font-black text-right">Aksi Terpadu Panitia</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {sessions.length === 0 && !loading && (
                    <tr><td colSpan={3} className="text-center py-8 font-bold text-gray-400">Belum ada sesi aktif.</td></tr>
                  )}
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-indigo-50/50 transition-colors border-b border-gray-200 last:border-0 group">
                      
                      {/* Info Sesi */}
                      <td className="py-5 px-5">
                         <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <p className="font-black text-gray-900 text-base">{session.title || 'Ujian Nasional'}</p>
                         </div>
                         <div className="flex items-center space-x-2 pl-4">
                           <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono font-bold">ID: {session.id.substring(0,8)}</span>
                           <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{session.duration_minutes || 90} MNT</span>
                         </div>
                      </td>

                      {/* Live Token */}
                      <td className="py-5 px-5">
                        <div className="flex flex-col items-center p-2 bg-indigo-50 border-2 border-indigo-100 rounded-xl">
                          <div className="flex items-center">
                            <Key className="w-4 h-4 text-indigo-600 mr-2" />
                            <span className="font-mono font-black text-indigo-800 text-lg tracking-[0.2em]">
                              {liveTokens[session.id] || '------'}
                            </span>
                          </div>
                          <div className="w-full border-t border-indigo-200/50 my-1.5"></div>
                          <p className="text-[10px] font-bold text-indigo-500 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Update: <span className={`ml-1 font-mono ${countdown < 60 ? 'text-rose-600 animate-pulse' : 'text-indigo-700'}`}>{formatTime(countdown)}</span>
                          </p>
                        </div>
                      </td>

                      {/* 3 Tombol Aksi Baru */}
                      <td className="py-5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          
                          {/* 1. Edit Bank Soal */}
                          <Link href={`/hq/llms/${session.id}/questions`} className="flex flex-col items-center group/btn">
                            <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg group-hover/btn:bg-indigo-600 group-hover/btn:text-white transition-all border border-gray-200 group-hover/btn:border-indigo-700 shadow-sm">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-500 mt-1 group-hover/btn:text-indigo-600">SOAL</span>
                          </Link>

                          {/* 2. Live Monitor Peserta (NEW) */}
                          <Link href={`/hq/llms/${session.id}/monitor`} className="flex flex-col items-center group/btn">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all border border-blue-200 group-hover/btn:border-blue-700 shadow-sm relative">
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                              <Monitor className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-blue-600 mt-1">PANTAU</span>
                          </Link>

                          {/* 3. Realtime Scoring */}
                          <Link href={`/hq/llms/${session.id}/leaderboard`} className="flex flex-col items-center group/btn">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover/btn:bg-amber-500 group-hover/btn:text-white transition-all border border-amber-200 group-hover/btn:border-amber-600 shadow-sm">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-amber-600 mt-1">SKOR</span>
                          </Link>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KANAN: PANEL COMMANDS & SECURITY LOG */}
          <div className="space-y-6">
            
            {/* QUICK COMMANDS */}
            <div className="animate-stagger-4 bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-sm">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 border-b-2 border-gray-100 pb-2">Quick Commands</h2>
              <div className="space-y-3">
                <Link href="/hq/llms/broadcast" className="w-full flex items-center justify-between p-4 bg-[#5145cd] hover:bg-[#372b9c] text-white rounded-xl transition-all border border-[#372b9c] shadow-md group">
                  <span className="text-xs font-black uppercase tracking-widest">Kirim Broadcast</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button onClick={fetchData} className="w-full flex items-center justify-center p-4 bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl transition-all font-black text-xs uppercase tracking-widest">
                  <RotateCcw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Statistik
                </button>
              </div>
            </div>

            {/* 🔥 SECURITY LOG (NEW & FUNCTIONAL) 🔥 */}
            <div className={`animate-stagger-4 p-5 rounded-2xl border-2 shadow-sm transition-colors ${securityLogs.length > 0 ? 'bg-rose-50/20 border-rose-200' : 'bg-emerald-50/20 border-emerald-100'}`}>
              <div className={`flex items-center justify-between mb-4 border-b-2 pb-2 ${securityLogs.length > 0 ? 'border-rose-100' : 'border-emerald-100/50'}`}>
                <h2 className={`text-sm font-black uppercase tracking-widest ${securityLogs.length > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>Security Log</h2>
                <span className={`px-2 py-1 text-white text-[9px] font-black uppercase rounded shadow-sm ${securityLogs.length > 0 ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'}`}>
                  Live Feed
                </span>
              </div>
              
              {refreshing && securityLogs.length === 0 ? (
                 <div className="py-6 text-center text-xs text-gray-400 font-bold animate-pulse">Menyelaraskan Radar...</div>
              ) : securityLogs.length === 0 ? (
                // STATE 1: JIKA AMAN (KOSONG)
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mb-2 drop-shadow-sm" />
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Aman Terkendali</p>
                  <p className="text-[10px] text-emerald-600/70 mt-1 font-bold">Integritas ujian 100% terjaga.</p>
                </div>
              ) : (
                // STATE 2: JIKA ADA PELANGGARAN
                <div className="space-y-3">
                  {securityLogs.map(log => (
                    <div key={log.id} className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-rose-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-rose-500"></div>
                      <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-gray-800 truncate">{log.userId}</p>
                        <p className="text-[9px] font-bold text-rose-600 mt-0.5">{log.count}x Keluar Layar</p>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 font-bold">{log.time}</span>
                    </div>
                  ))}
                  
                  {/* TOMBOL UNDUH LAPORAN */}
                  <button 
                    onClick={downloadSecurityReport}
                    className="w-full mt-3 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center shadow-sm group"
                  >
                    <FileDown className="w-4 h-4 mr-1.5 group-hover:-translate-y-0.5 transition-transform" /> Unduh Laporan (.CSV)
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* --- MODAL TAMBAH SESI (PRESERVED) --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 text-left">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-gray-800">Buka Sesi Ujian Baru</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all active:scale-90"><X size={24} /></button>
              </div>

              <div className="space-y-6 text-left">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Judul Sesi</label>
                    <input type="text" value={newSession.title} onChange={(e) => setNewSession({...newSession, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Contoh: Matematika Dasar" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Token Akses Master</label>
                       <input type="text" value={newSession.token} onChange={(e) => setNewSession({...newSession, token: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="TOKEN123" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Durasi (Menit)</label>
                       <input type="number" value={newSession.duration_minutes} onChange={(e) => setNewSession({...newSession, duration_minutes: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                    </div>
                 </div>
                 <button onClick={handleAddSession} disabled={isSaving} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Bangun Sesi Sekarang</>}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
