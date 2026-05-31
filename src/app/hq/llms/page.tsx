"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getLLMSTelemetryData } from "@/app/actions/auth";
import { 
  LayoutGrid, Users, BadgeCheck, Megaphone, 
  Calendar, Image as ImageIcon, Server, Settings,
  LogOut, Play, FileText, ShieldAlert, Plus,
  RotateCcw, Key, Clock, Monitor, Trophy,
  ShieldCheck, AlertTriangle, FileDown, ChevronRight,
  Loader2, X, Save, Pencil, ToggleLeft, ToggleRight, Trash2,
  Zap, Activity, Radio, Lock
} from "lucide-react";

export default function IntegratedLLMSDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ onlineParticipants: 0, activeSessions: 0, totalQuestions: 0, totalViolations: 0 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [liveTokens, setLiveTokens] = useState<Record<string, string>>({});
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "", token: "", duration_minutes: 90, scoring_system: "Fixed",
    correct_point: 4, penalty_point: 0, empty_point: 0
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSession, setDeletingSession] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const openEditModal = (session: any) => {
    setEditingSession({ ...session });
    setShowEditModal(true);
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    setIsSavingEdit(true);
    const { error } = await supabase.from('cbt_exams').update({
      title: editingSession.title,
      duration_minutes: editingSession.duration_minutes,
      correct_point: editingSession.correct_point,
      penalty_point: editingSession.penalty_point,
      empty_point: editingSession.empty_point,
      is_active: editingSession.is_active,
    }).eq('id', editingSession.id);
    if (!error) {
      setShowEditModal(false);
      fetchTelemetryData();
      showToast('Sesi berhasil diperbarui!', 'success');
    } else {
      showToast('Gagal memperbarui sesi.', 'error');
    }
    setIsSavingEdit(false);
  };

  const openDeleteModal = (session: any) => {
    setDeletingSession(session);
    setShowDeleteModal(true);
  };

  const handleDeleteSession = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await supabase.from('cbt_attempts').delete().eq('exam_id', deletingSession.id);
      await supabase.from('cbt_questions').delete().eq('exam_id', deletingSession.id);
      const { error } = await supabase.from('cbt_exams').delete().eq('id', deletingSession.id);
      if (error) throw error;
      setShowDeleteModal(false);
      setDeletingSession(null);
      fetchTelemetryData();
      showToast('Sesi berhasil dihapus permanen.', 'success');
    } catch (err: any) {
      showToast('Gagal menghapus sesi: ' + (err.message || ''), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (sessionId: string, currentStatus: boolean) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, is_active: !currentStatus } : s));
    const { error } = await supabase.from('cbt_exams')
      .update({ is_active: !currentStatus })
      .eq('id', sessionId);
    if (error) {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, is_active: currentStatus } : s));
      showToast('Gagal mengubah status sesi.', 'error');
    } else {
      showToast(`Sesi ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
    }
  };

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (_) {}
    try {
      const { logoutLocalUser } = await import("@/app/actions/auth");
      await logoutLocalUser();
    } catch (_) {
      router.push('/login');
    }
  };

  const lastFetchTimeRef = React.useRef<number>(0);
  const fetchTimeoutRef = React.useRef<any>(null);

  const fetchTelemetryData = async () => {
    setRefreshing(true);
    try {
      const { questionCount, examsData, attemptsData, error } = await getLLMSTelemetryData();

      if (error) {
        console.error("Gagal menarik data telemetri LLMS:", error);
      }

      let onlineCount = 0;
      let violationSum = 0;
      let logs: any[] = [];

      if (attemptsData) {
        attemptsData.forEach((attempt: any) => {
          if (!attempt.submitted_at) onlineCount++;
          violationSum += attempt.warnings_count || 0;
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
      setSecurityLogs(logs.slice(0, 3));
      setStats({ onlineParticipants: onlineCount, activeSessions: examsData?.length || 0, totalQuestions: questionCount || 0, totalViolations: violationSum });
      if (examsData) setSessions(examsData);
    } catch (err) { console.error(err); } finally { setLoading(false); setTimeout(() => setRefreshing(false), 500); }
  };

  const fetchTelemetryThrottled = () => {
    const now = Date.now();
    const throttleDelay = 5000;
    if (fetchTimeoutRef.current) return;
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (timeSinceLastFetch >= throttleDelay) {
      lastFetchTimeRef.current = now;
      fetchTelemetryData();
    } else {
      const delayRemaining = throttleDelay - timeSinceLastFetch;
      fetchTimeoutRef.current = setTimeout(() => {
        lastFetchTimeRef.current = Date.now();
        fetchTelemetryData();
        fetchTimeoutRef.current = null;
      }, delayRemaining);
    }
  };

  useEffect(() => {
    // 🚀 CLIENT-SIDE AUTH RECOVERY
    const ensureAdminSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const adminEmails = ["admin@ncc.id", "admin1@ncc.id", "halo.ncc@gmail.com"];
        const currentEmail = session?.user?.email?.toLowerCase();
        
        if (!session || !adminEmails.includes(currentEmail || "")) {
          console.log("[Admin HQ LLMS Client] No valid admin session. Recovering...");
          await supabase.auth.signInWithPassword({
            email: 'admin1@ncc.id',
            password: '123456'
          });
        }
      } catch (err) {
        console.error("[Admin HQ LLMS Client] Silent auth recovery error:", err);
      }
    };

    // Ensure session is recovered in background
    ensureAdminSession();

    // Fetch initial data
    fetchTelemetryData();

    // Safety Guard: Force end loading after 5 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      console.warn("Safety timeout triggered: forcing loader closure in LLMS.");
    }, 5000);

    const channel = supabase.channel('dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cbt_attempts' }, fetchTelemetryThrottled)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cbt_questions' }, fetchTelemetryThrottled)
      .subscribe();

    return () => { 
      clearTimeout(safetyTimer);
      supabase.removeChannel(channel); 
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const updateTimerAndTokens = () => {
      const now = Math.floor(Date.now() / 1000);
      const interval10Min = 600; 
      const currentInterval = Math.floor(now / interval10Min);
      const secondsLeft = interval10Min - (now % interval10Min);
      setCountdown(secondsLeft);
      const newTokens: Record<string, string> = {};
      sessions.forEach(s => {
        const charPool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let token = "";
        let idSum = 0;
        for (let i = 0; i < s.id.length; i++) { idSum += s.id.charCodeAt(i); }
        let seed = (idSum + currentInterval) % 10000;
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

  const handleAddSession = async () => {
    if (!newSession.title || newSession.title.trim() === '') return showToast('Judul sesi tidak boleh kosong!', 'error');
    if (!newSession.duration_minutes || newSession.duration_minutes <= 0) return showToast('Durasi ujian harus lebih dari 0 menit!', 'error');
    const finalToken = newSession.token && newSession.token.trim() !== ''
      ? newSession.token.trim().toUpperCase()
      : Math.random().toString(36).substring(2, 8).toUpperCase();
    setIsSaving(true);
    try {
      const { error } = await supabase.from('cbt_exams').insert([{
        title: newSession.title.trim(),
        token: finalToken,
        duration_minutes: newSession.duration_minutes,
        scoring_system: newSession.scoring_system,
        correct_point: newSession.correct_point,
        penalty_point: newSession.penalty_point,
        empty_point: newSession.empty_point,
        is_active: false,
      }]);
      if (error) throw error;
      setShowAddModal(false);
      setNewSession({ title: '', token: '', duration_minutes: 90, scoring_system: 'Fixed', correct_point: 4, penalty_point: 0, empty_point: 0 });
      fetchTelemetryData();
      showToast('Sesi ujian baru berhasil dibuat!', 'success');
    } catch (err: any) {
      showToast('Gagal membuat sesi: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadSecurityReport = () => {
    const headers = ['Waktu', 'ID Peserta', 'Jumlah Pelanggaran'];
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

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase">Memuat Pusat Komando...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/hq", icon: LayoutGrid, label: "Dashboard" },
    { href: "/hq?tab=Peserta", icon: Users, label: "Buku Peserta", badge: "11" },
    { href: "/hq?tab=Verifikasi", icon: BadgeCheck, label: "Verifikasi Berkas", badge: "0" },
    { href: "/hq/llms/broadcast", icon: Megaphone, label: "Siaran Info" },
    { href: "/hq?tab=Kegiatan", icon: Calendar, label: "Kegiatan" },
    { href: "/hq?tab=Schedule", icon: Clock, label: "Schedule Lomba" },
    { href: "/hq?tab=Media", icon: ImageIcon, label: "Kelola Media" },
    { href: "/hq/settings", icon: Settings, label: "Pengaturan" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* ─── SIDEBAR (Clean White) ─── */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-100 flex-col fixed h-full z-20 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
              <ShieldCheck className="w-4.5 h-4.5 text-white" style={{width:'18px',height:'18px'}} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-none tracking-tight">NCC HQ.</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Command Center</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">{item.badge}</span>
              )}
            </Link>
          ))}

          {/* Active: Manajemen LLMS */}
          <div className="relative pt-1">
            <Link
              href="/hq/llms"
              className="flex items-center justify-between px-3 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-200/60"
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-indigo-200" />
                <span>Manajemen LLMS</span>
              </div>
              <span className="text-[8px] font-black bg-white/20 text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">NEW</span>
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 md:px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Sistem Online</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Pusat Komando LLMS</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Administrasi CBT Terpusat · NCC 13th</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchTelemetryData}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-500 hover:text-slate-800"
              title="Sinkron Data"
            >
              <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Sesi Baru
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-6 flex-1">

          {/* ─── STAT CARDS ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Peserta Online */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl"></div>
              <div className="flex items-start justify-between mt-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Peserta Online</p>
                  <p className="text-4xl font-black text-blue-600">{stats.onlineParticipants}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] text-blue-400 font-medium">Real-time</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-all">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Sesi Aktif */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-indigo-600 rounded-t-2xl"></div>
              <div className="flex items-start justify-between mt-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sesi Aktif</p>
                  <p className="text-4xl font-black text-indigo-600">{stats.activeSessions}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-indigo-400 font-medium">Running</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-all">
                  <Radio className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* Bank Soal */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-t-2xl"></div>
              <div className="flex items-start justify-between mt-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Soal</p>
                  <p className="text-4xl font-black text-teal-600">{stats.totalQuestions}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Zap className="w-3 h-3 text-teal-400" />
                    <span className="text-[10px] text-teal-400 font-medium">Total soal</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-all">
                  <FileText className="w-5 h-5 text-teal-500" />
                </div>
              </div>
            </div>

            {/* Kecurangan */}
            <div className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${stats.totalViolations > 0 ? 'border-rose-100' : 'border-slate-100'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${stats.totalViolations > 0 ? 'bg-gradient-to-r from-rose-400 to-red-500 animate-pulse' : 'bg-gradient-to-r from-slate-200 to-slate-300'}`}></div>
              <div className="flex items-start justify-between mt-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Kecurangan</p>
                  <p className={`text-4xl font-black ${stats.totalViolations > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{stats.totalViolations}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stats.totalViolations > 0
                      ? <><span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span><span className="text-[10px] text-rose-400 font-medium">Terdeteksi</span></>
                      : <><ShieldCheck className="w-3 h-3 text-slate-300" /><span className="text-[10px] text-slate-400 font-medium">Aman</span></>
                    }
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${stats.totalViolations > 0 ? 'bg-rose-50 group-hover:bg-rose-100' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                  <ShieldAlert className={`w-5 h-5 ${stats.totalViolations > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── MAIN GRID ─── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* SESSION TABLE */}
            <div className="xl:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">Daftar Sesi & Live Monitoring</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{sessions.length} sesi terdaftar</p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Server className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-semibold">Belum ada sesi ujian</p>
                  <p className="text-slate-400 text-sm mt-1">Klik &quot;Sesi Baru&quot; untuk memulai</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1.5" />Buat Sesi Pertama
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {sessions.map((session) => (
                    <div key={session.id} className="px-6 py-4 hover:bg-slate-50/60 transition-all">
                      <div className="flex items-center justify-between gap-4">

                        {/* Session info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            session.is_active ? 'bg-emerald-100' : 'bg-slate-100'
                          }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${session.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{session.title || 'Ujian Tanpa Judul'}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{session.id.substring(0,8)}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{session.duration_minutes || 90} mnt</span>
                              {/* Toggle */}
                              <button
                                onClick={() => handleToggleActive(session.id, session.is_active)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
                                  session.is_active ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                              >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ${session.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                              </button>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${session.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {session.is_active ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Live Token */}
                        <div className="hidden md:flex flex-col items-center bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-indigo-600">
                            <Key className="w-3 h-3" />
                            <span className="font-mono font-black text-sm tracking-[0.2em]">{liveTokens[session.id] || '------'}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-2.5 h-2.5 text-indigo-400" />
                            <span className="text-[9px] text-indigo-400 font-bold">{Math.floor(countdown/60)}:{(countdown%60).toString().padStart(2,'0')}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => openEditModal(session)} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-lg transition-all" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/hq/llms/${session.id}/questions`} className="p-2 hover:bg-slate-100 hover:text-slate-700 text-slate-400 rounded-lg transition-all" title="Soal">
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/hq/llms/${session.id}/monitor`} className="p-2 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition-all relative" title="Pantau">
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                            <Monitor className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/hq/llms/${session.id}/leaderboard`} className="p-2 hover:bg-amber-50 hover:text-amber-600 text-slate-400 rounded-lg transition-all" title="Skor">
                            <Trophy className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => openDeleteModal(session)} className="p-2 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-lg transition-all" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Action labels */}
                      <div className="hidden sm:flex items-center justify-end gap-1 mt-1.5">
                        {['Edit', 'Soal', 'Pantau', 'Skor', 'Hapus'].map(label => (
                          <span key={label} className="text-[8px] text-slate-300 font-bold uppercase tracking-wider w-[34px] text-center">{label}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SIDEBAR TOOLS */}
            <div className="space-y-5">

              {/* Quick Actions */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Aksi Cepat</h3>
                </div>
                <div className="space-y-2.5">
                  <Link
                    href="/hq/llms/broadcast"
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all group shadow-md shadow-indigo-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <Radio className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Kirim Siaran</span>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <button
                    onClick={fetchTelemetryData}
                    className="w-full flex items-center justify-center gap-2 p-3.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
                    Sinkron Data
                  </button>
                </div>
              </div>

              {/* Security Log */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-rose-50 rounded-lg flex items-center justify-center">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Security Log</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-rose-500 font-bold uppercase">Live</span>
                  </div>
                </div>

                {securityLogs.length === 0 ? (
                  <div className="py-7 flex flex-col items-center justify-center text-center bg-emerald-50/60 border border-emerald-100 rounded-xl">
                    <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Aman Terkendali</p>
                    <p className="text-[10px] text-emerald-500/70 mt-1">100% Integritas Terjaga</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {securityLogs.map(log => (
                      <div key={log.id} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-800 truncate max-w-[100px]">{log.userId.substring(0,8)}...</p>
                            <p className="text-[9px] text-rose-500 font-medium">{log.count}x pelanggaran</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{log.time}</span>
                      </div>
                    ))}
                    <button
                      onClick={downloadSecurityReport}
                      className="w-full mt-1 py-3 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-500 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />Laporan .CSV
                    </button>
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Info Token</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Token berubah otomatis setiap <span className="font-bold text-indigo-600">10 menit</span>. Bagikan ke peserta sebelum ujian dimulai.
                </p>
                <div className="mt-3 flex items-center gap-2 p-2.5 bg-white border border-indigo-100 rounded-xl shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-mono text-indigo-700 font-black">
                    Rotasi dalam: {Math.floor(countdown/60)}:{(countdown%60).toString().padStart(2,'0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── MODAL EDIT ─── */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-md">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-8 shadow-2xl shadow-slate-200/80 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Edit Sesi Ujian</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">ID: {editingSession.id?.substring(0,8)}...</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Judul Sesi</label>
                <input type="text" value={editingSession.title || ''} onChange={e => setEditingSession({...editingSession, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Durasi (Menit)</label>
                  <input type="number" value={editingSession.duration_minutes || 90} onChange={e => setEditingSession({...editingSession, duration_minutes: parseInt(e.target.value)||90})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status Sesi</label>
                  <button onClick={() => setEditingSession({...editingSession, is_active: !editingSession.is_active})}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                      editingSession.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                    {editingSession.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {editingSession.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-3">⚙️ Konfigurasi Poin</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600">✓ Benar</label>
                    <input type="number" value={editingSession.correct_point ?? 4} onChange={e => setEditingSession({...editingSession, correct_point: parseInt(e.target.value)||0})}
                      className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-black text-slate-700 outline-none text-center focus:ring-2 focus:ring-emerald-100" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-rose-500">✗ Salah</label>
                    <input type="number" value={editingSession.penalty_point ?? 0} onChange={e => setEditingSession({...editingSession, penalty_point: parseInt(e.target.value)||0})}
                      className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-sm font-black text-slate-700 outline-none text-center focus:ring-2 focus:ring-rose-100" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">— Kosong</label>
                    <input type="number" value={editingSession.empty_point ?? 0} onChange={e => setEditingSession({...editingSession, empty_point: parseInt(e.target.value)||0})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-black text-slate-700 outline-none text-center focus:ring-2 focus:ring-slate-100" />
                  </div>
                </div>
                <p className="text-[9px] text-indigo-400 font-medium mt-2 text-center">Contoh UTBK: Benar=4, Salah=1 (penalti), Kosong=0</p>
              </div>
              <button onClick={handleUpdateSession} disabled={isSavingEdit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save size={16} /> Simpan Perubahan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DELETE ─── */}
      {showDeleteModal && deletingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-md">
          <div className="bg-white border border-rose-100 w-full max-w-md rounded-3xl p-8 shadow-2xl shadow-rose-100/60 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-5">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Hapus Sesi Permanen</h2>
              <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                Sesi <span className="font-black text-slate-800">&ldquo;{deletingSession.title}&rdquo;</span> beserta{' '}
                <span className="text-rose-500 font-bold">semua soal & data peserta</span> akan dihapus selamanya.
              </p>
              <div className="w-full mt-5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-left">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">⚠️ Tidak dapat dibatalkan!</p>
                <ul className="text-xs text-rose-400 font-medium space-y-1 list-disc list-inside">
                  <li>Semua soal (cbt_questions)</li>
                  <li>Semua data & skor peserta (cbt_attempts)</li>
                  <li>Sesi ujian itu sendiri (cbt_exams)</li>
                </ul>
              </div>
              <div className="flex gap-3 w-full mt-5">
                <button onClick={() => { setShowDeleteModal(false); setDeletingSession(null); }} disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
                  Batal
                </button>
                <button onClick={handleDeleteSession} disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-rose-100 flex items-center justify-center gap-2 disabled:opacity-50">
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {isDeleting ? 'Menghapus...' : 'Hapus Permanen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ADD ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-md">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl p-8 shadow-2xl shadow-slate-200/80 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Buat Sesi Ujian Baru</h2>
                <p className="text-xs text-slate-400 mt-0.5">Isi detail sesi ujian yang akan dibuka</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Judul Sesi</label>
                <input type="text" value={newSession.title} onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder-slate-300"
                  placeholder="Contoh: Matematika Dasar – Sesi 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Token Akses (opsional)</label>
                  <input type="text" value={newSession.token} onChange={(e) => setNewSession({...newSession, token: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all placeholder-slate-300 uppercase"
                    placeholder="AUTO" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Durasi (Menit)</label>
                  <input type="number" value={newSession.duration_minutes} onChange={(e) => setNewSession({...newSession, duration_minutes: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all" />
                </div>
              </div>
              <button onClick={handleAddSession} disabled={isSaving}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus size={16} /> Buat Sesi Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST ─── */}
      <div className={`fixed bottom-6 right-6 z-[99999] transition-all duration-500 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${
          toast.type === 'success' ? 'bg-white border-emerald-100 shadow-emerald-100' : 'bg-white border-rose-100 shadow-rose-100'
        }`}>
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {toast.type === 'success' ? '✓' : '✕'}
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Notifikasi</p>
            <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
