"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, GraduationCap, Clock, Plus, 
  Trash2, ExternalLink, ShieldCheck, Download,
  Activity, AlertTriangle, CheckCircle, Search,
  ChevronRight, Calendar, UserPlus, FileText
} from "lucide-react";

export default function ManajemenJadwalLLMS() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalQuestions: 0,
    liveParticipants: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- 📡 DATA FETCHING ENGINE ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase
          .from('cbt_exams')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (sessionData) {
          setSessions(sessionData);
          setStats(prev => ({
            ...prev,
            activeSessions: sessionData.filter(s => s.is_active).length
          }));
        }

        // Fetch other stats...
        const { count: qCount } = await supabase.from('cbt_questions').select('*', { count: 'exact', head: true });
        setStats(prev => ({ ...prev, totalQuestions: qCount || 0 }));

      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 animate-pulse uppercase">Memuat Sistem LLMS...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <GraduationCap size={20} />
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Markas Besar LLMS</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manajemen Sesi Ujian</h1>
              <p className="text-slate-500 font-medium mt-1">Konfigurasi jadwal, token, dan sinkronisasi bank soal real-time.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Database Sync: Active
               </div>
               <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-all">
                  <Plus size={18} /> Sesi Baru
               </button>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sesi Aktif</p>
               <h2 className="text-3xl font-black text-slate-800">{stats.activeSessions}</h2>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bank Soal</p>
               <h2 className="text-3xl font-black text-slate-800">{stats.totalQuestions}</h2>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peserta Live</p>
               <h2 className="text-3xl font-black text-indigo-600">{stats.liveParticipants}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT: SESSION LIST */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 hover:border-indigo-300 transition-all group flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
               <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${session.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {session.title.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{session.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">TOKEN: {session.token}</span>
                       <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">{session.duration_minutes} Menit</span>
                       {session.start_time && (
                         <span className="text-[10px] font-black text-slate-400">Jadwal: {new Date(session.start_time).toLocaleString('id-ID')}</span>
                       )}
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <Link 
                    href={`/hq/llms/${session.id}/questions`}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FileText size={16} /> Kelola Bank Soal
                  </Link>
                  <button className="px-6 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 py-20 text-center">
              <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="font-black text-slate-800">Belum ada Sesi Ujian</h3>
              <p className="text-slate-400 text-sm">Klik tombol + Sesi Baru untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
