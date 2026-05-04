"use client";

import React, { useState, useEffect, useRef } from "react";
import * as htmlToImage from 'html-to-image';
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; 
import { 
  LayoutDashboard, Users, FileCheck, Settings, 
  Download, Calendar, Bell, MoreHorizontal, Search, Filter, Printer, X, IdCard, Megaphone, Send,
  CheckCircle2, AlertCircle, LogOut, Trash2, MapPin, Target, XCircle, Power, Shield, Clock, CalendarDays, FolderOpen, ShieldCheck, CheckCircle, FileText, ImageIcon, Camera, Trophy, Medal, ClipboardCheck, Save, Sparkles, ArrowRight
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from "recharts";

const supabase = createClient();

export default function ModernHQDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [realEntries, setRealEntries] = useState<any[]>([]);
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);
  const [dynamicBarData, setDynamicBarData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [timeFilter, setTimeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("LKTI Nasional");
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const [selectedIdCard, setSelectedIdCard] = useState<any | null>(null);
  
  // --- STATE KENDALI ---
  const [isSavingTimeline, setIsSavingTimeline] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("All");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const [timelineData, setTimelineData] = useState<any[]>([
    {
      category: "LKTI Nasional",
      waves: [
        { label: "Gelombang I", items: [{ label: "Pendaftaran & Abstrak", date: "16 Juli – 3 September" }, { label: "Pengumuman Tahap I", date: "10 September" }, { label: "Pengumpulan Fullpaper", date: "12 – 18 September" }] },
        { label: "Gelombang II", items: [{ label: "Pendaftaran & Abstrak", date: "1 – 25 Oktober" }, { label: "Pengumuman Tahap I", date: "31 Oktober" }] }
      ]
    },
    {
      category: "Olimpiade MIPA",
      waves: [
        { label: "Gelombang I", items: [{ label: "Pendaftaran", date: "16 Juli – 3 September" }, { label: "Seleksi 1", date: "10 September" }] },
        { label: "Gelombang II", items: [{ label: "Pendaftaran", date: "1 – 25 Oktober" }, { label: "Simulasi", date: "29 Oktober" }] }
      ]
    },
    { category: "Speech Contest", waves: [{ label: "Gelombang I", items: [{ label: "Pendaftaran", date: "16 Juli" }] }] },
    { category: "MTQ", waves: [{ label: "Gelombang I", items: [{ label: "Pendaftaran", date: "16 Juli" }] }] }
  ]);

  const [submissionStatus, setSubmissionStatus] = useState([
    { id: 'mipa_g1', name: 'Olimpiade MIPA (Gel. I)', isOpen: false, mode: "Manual" },
    { id: 'mipa_g2', name: 'Olimpiade MIPA (Gel. II)', isOpen: false, mode: "Manual" },
    { id: 'speech_g1', name: 'Speech Contest (Gel. I)', isOpen: false, mode: "Manual" },
    { id: 'speech_g2', name: 'Speech Contest (Gel. II)', isOpen: false, mode: "Manual" },
    { id: 'lkti_g1', name: 'LKTI Nasional (Gel. I)', isOpen: true, mode: "Manual" },
    { id: 'lkti_g2', name: 'LKTI Nasional (Gel. II)', isOpen: false, mode: "Manual" },
    { id: 'mtq_g1', name: 'MTQ (Gel. I)', isOpen: false, mode: "Manual" },
    { id: 'mtq_g2', name: 'MTQ (Gel. II)', isOpen: false, mode: "Manual" },
  ]);

  const [phaseStatus, setPhaseStatus] = useState([
    { id: 'tahap1', name: 'Penyisihan', isOpen: true },
    { id: 'tahap2', name: 'Semi Final', isOpen: false },
    { id: 'tahap3', name: 'Grand Final', isOpen: false },
  ]);

  const [waves, setWaves] = useState([
    { id: 1, name: "Gelombang 1", status: "Aktif" },
    { id: 2, name: "Gelombang 2", status: "Tutup" },
  ]);

  const [dashboardAssets, setDashboardAssets] = useState<any>({
    gallery_images: []
  });

  // --- UI NOTIFICATION SYSTEM ---
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: () => {} });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000); 
  };

  // --- DATA SYNC ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const { data: entries } = await supabase.from('competition_entries').select('*').neq('email', 'admin1@ncc.id').order('created_at', { ascending: false });
      if (entries) setRealEntries(entries);

      const { data: timeline } = await supabase.from('announcements').select('*').eq('type', 'SYSTEM_TIMELINE').single();
      if (timeline) setTimelineData(JSON.parse(timeline.content));

      const { data: portal } = await supabase.from('announcements').select('*').eq('title', 'SYS_PORTAL_SETTINGS').single();
      if (portal) {
        const p = JSON.parse(portal.content);
        if (p.submissionStatus) setSubmissionStatus(p.submissionStatus);
        if (p.waves) setWaves(p.waves);
        if (p.phaseStatus) setPhaseStatus(p.phaseStatus);
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (realEntries.length === 0) return;
    const catMap: any = {};
    const dateMap: any = {};
    realEntries.forEach(e => {
      const cat = e.competition_type || "General";
      catMap[cat] = (catMap[cat] || 0) + 1;
      const d = new Date(e.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dateMap[d] = (dateMap[d] || 0) + 1;
    });
    setDynamicBarData(Object.keys(catMap).map(k => ({ name: k, total: catMap[k] })));
    setDynamicChartData(Object.keys(dateMap).map(k => ({ name: k, pendaftar: dateMap[k] })));
  }, [realEntries]);

  // --- ACTIONS ---
  const handleUpdateStatus = async (id: any, newStatus: string) => {
    setConfirmModal({
      show: true,
      title: `Konfirmasi ${newStatus}`,
      message: `Apakah Anda yakin ingin mengubah status peserta ini menjadi ${newStatus}?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        await supabase.from('competition_entries').update({ payment_status: newStatus }).eq('id', id);
        setRealEntries(prev => prev.map(e => e.id === id ? { ...e, payment_status: newStatus } : e));
        showToast(`Peserta #${id} berhasil diverifikasi!`, "success");
      }
    });
  };

  const handleUpdateStage = async (id: any, stage: number) => {
    const entry = realEntries.find(e => e.id === id);
    let notes = {}; try { notes = JSON.parse(entry.notes); } catch(e) {}
    const newNotes = JSON.stringify({ ...notes, current_stage: stage });
    await supabase.from('competition_entries').update({ notes: newNotes }).eq('id', id);
    setRealEntries(prev => prev.map(e => e.id === id ? { ...e, notes: newNotes } : e));
    if (selectedParticipant) setSelectedParticipant((p:any) => ({ ...p, notes: newNotes }));
    showToast(`Tahap peserta #${id} diperbarui ke Tahap ${stage}`, "success");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden relative">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Liquid Glass */}
      <aside className="w-72 bg-white/70 backdrop-blur-2xl border-r border-white/60 flex flex-col z-20 shadow-xl shadow-slate-200/20">
        <div className="p-8 flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/50">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div><h1 className="font-black text-xl tracking-tight">NCC HQ.</h1><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Command Center</p></div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {[
            { id: "Dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
            { id: "Peserta", icon: <Users size={18} />, label: "Buku Peserta" },
            { id: "Verifikasi", icon: <CheckCircle size={18} />, label: "Verifikasi", count: realEntries.filter(e => e.payment_status === 'Pending').length },
            { id: "Kegiatan", icon: <CalendarDays size={18} />, label: "Kegiatan" },
            { id: "Schedule", icon: <Calendar size={18} />, label: "Schedule Lomba" },
            { id: "Media", icon: <ImageIcon size={18} />, label: "Kelola Media" },
            { id: "Pengaturan", icon: <Settings size={18} />, label: "Pengaturan" }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 group ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-white hover:text-blue-600"}`}>
              <div className="flex items-center gap-3">{item.icon} {item.label}</div>
              {item.count ? <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>{item.count}</span> : null}
            </button>
          ))}
        </nav>
        
        <div className="p-6"><button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-colors"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 relative z-10">
        <header className="flex justify-between items-center mb-10">
          <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">{activeTab}</h1><p className="text-slate-500 font-medium mt-1">Sistem kendali terpadu NCC 13th.</p></div>
          <button className="flex items-center gap-3 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all"><Download size={18} /> Export Data Master</button>
        </header>

        {/* ================= TABS CONTENT ================= */}
        {activeTab === "Dashboard" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Pendaftar" value={realEntries.length} icon={<Users />} color="blue" />
              <StatCard title="Verifikasi" value={realEntries.filter(e => e.payment_status === 'Verified').length} icon={<CheckCircle />} color="emerald" />
              <StatCard title="Antrean" value={realEntries.filter(e => e.payment_status === 'Pending').length} icon={<Clock />} color="amber" />
              <StatCard title="Kategori" value="4" icon={<Target />} color="indigo" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/20 h-96">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Sparkles className="text-blue-500" size={20} /> Tren Pendaftaran</h3>
                <ResponsiveContainer width="100%" height="85%"><AreaChart data={dynamicChartData}><defs><linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="name" hide /><Tooltip /><Area type="monotone" dataKey="pendaftar" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorP)" /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/20 h-96">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2"><Target className="text-indigo-500" size={20} /> Distribusi Lomba</h3>
                <ResponsiveContainer width="100%" height="85%"><BarChart data={dynamicBarData}><XAxis dataKey="name" hide /><Tooltip /><Bar dataKey="total" fill="#6366f1" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Peserta" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/30 overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/40">
              <div className="relative w-full md:w-96"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Cari berdasarkan nama atau ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" /></div>
              <div className="flex gap-3 w-full md:w-auto">{["LKTI Nasional", "Olimpiade MIPA", "MTQ"].map(c => <button key={c} onClick={() => setFilterCategory(c)} className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${filterCategory === c ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{c}</button>)}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]"><th className="p-8">ID Peserta</th><th className="p-8">Informasi Profil</th><th className="p-8">Asal Sekolah</th><th className="p-8">Status Progres</th><th className="p-8">Detail</th></tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {realEntries.filter(e => filterCategory === "All" || e.competition_type === filterCategory).filter(e => e.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedParticipant(e)}>
                      <td className="p-8 font-black text-blue-600">NCC-13-{e.id}</td>
                      <td className="p-8"><div><p className="font-black text-slate-800 text-base">{e.full_name}</p><p className="text-xs text-slate-400 font-bold mt-0.5">{e.email}</p></div></td>
                      <td className="p-8 font-bold text-slate-600">{e.school_name || "Personal"}</td>
                      <td className="p-8">{(() => { let s = 1; try { s = JSON.parse(e.notes).current_stage || 1; } catch(err) {} return <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s === 3 ? 'bg-amber-500' : 'bg-blue-500'}`}></div><span className="font-black text-xs">TAHAP {s}</span></div>; })()}</td>
                      <td className="p-8"><button className="p-3 bg-slate-50 group-hover:bg-white rounded-xl transition-all"><ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Verifikasi" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {realEntries.filter(e => e.payment_status === 'Pending').length === 0 ? (
              <div className="col-span-full py-20 text-center"><Megaphone className="mx-auto text-slate-200 mb-4" size={64} /><p className="font-black text-slate-300 uppercase tracking-widest">Semua Berkas Sudah Terverifikasi</p></div>
            ) : realEntries.filter(e => e.payment_status === 'Pending').map(e => (
                <div key={e.id} className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-xl flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-100">{e.full_name[0]}</div>
                    <div><h4 className="font-black text-slate-800">{e.full_name}</h4><p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{e.competition_type}</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => window.open(e.payment_proof_url, '_blank')} className="py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><ImageIcon size={14} /> Cek Bukti</button>
                    <button onClick={() => handleUpdateStatus(e.id, 'Verified')} className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"><CheckCircle size={14} /> Setujui</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Kegiatan" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${isRegistrationOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><Power size={32} /></div>
                <div><h3 className="text-2xl font-black text-slate-800">Master Portal Pendaftaran</h3><p className="font-bold text-slate-500 mt-1">{isRegistrationOpen ? 'Sistem sedang menerima pendaftar baru secara terbuka.' : 'Akses pendaftaran dikunci oleh pusat komando.'}</p></div>
              </div>
              <button onClick={() => setIsRegistrationOpen(!isRegistrationOpen)} className={`w-24 h-12 rounded-full transition-all duration-500 relative p-1.5 ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`w-9 h-9 bg-white rounded-full shadow-lg transition-transform duration-500 ${isRegistrationOpen ? 'translate-x-12' : 'translate-x-0'}`} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-xl">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3"><CalendarDays className="text-blue-500" /> Wave Pendaftaran</h3>
                  <div className="space-y-4">{waves.map(w => <div key={w.id} className="flex justify-between items-center p-6 bg-slate-50/50 rounded-2xl border border-white"><p className="font-black text-slate-700">{w.name}</p><button onClick={() => { setWaves(prev => prev.map(wi => wi.id === w.id ? {...wi, status: wi.status === 'Aktif' ? 'Tutup' : 'Aktif'} : wi)); showToast(`${w.name} ${w.status === 'Aktif' ? 'Ditutup' : 'Diaktifkan'}`, "success"); }} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest ${w.status === 'Aktif' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border'}`}>{w.status.toUpperCase()}</button></div>)}</div>
               </div>
               <div className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-xl">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Trophy className="text-amber-500" /> Stage Perkembangan</h3>
                  <div className="grid grid-cols-1 gap-4">{phaseStatus.map(p => <button key={p.id} onClick={() => { setPhaseStatus(prev => prev.map(pi => pi.id === p.id ? {...pi, isOpen: !pi.isOpen} : pi)); showToast(`${p.name} diperbarui!`, "success"); }} className={`p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${p.isOpen ? 'bg-blue-50/50 border-blue-500/20' : 'bg-white border-slate-100 hover:border-slate-200'}`}><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${p.isOpen ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{p.id.slice(-1)}</div><span className={`font-black tracking-tight ${p.isOpen ? 'text-blue-700' : 'text-slate-400'}`}>{p.name}</span></div>{p.isOpen ? <CheckCircle className="text-blue-600" /> : <div className="w-6 h-6 border-2 border-slate-100 rounded-full" />}</button>)}</div>
               </div>
            </div>
          </div>
        )}

        {activeTab === "Schedule" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[3rem] text-white shadow-2xl shadow-blue-200 flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
               <div className="relative z-10"><h2 className="text-4xl font-black tracking-tight">Timeline Engine</h2><p className="text-blue-100 font-bold mt-2 opacity-80 uppercase tracking-widest text-xs">Sinkronisasi Tanggal Global NCC 13th</p></div>
               <button onClick={saveTimeline} className="relative z-10 bg-white text-blue-700 px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all">{isSavingTimeline ? <Clock className="animate-spin" /> : <Save />} UPDATE DATABASE</button>
            </div>
            <div className="flex flex-wrap gap-3">{["LKTI Nasional", "Olimpiade MIPA", "Speech Contest", "MTQ"].map(c => <button key={c} onClick={() => setFilterCategory(c)} className={`px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${filterCategory === c ? "bg-slate-800 text-white shadow-2xl" : "bg-white text-slate-400 hover:bg-slate-50 shadow-sm"}`}>{c.toUpperCase()}</button>)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {timelineData.find(c => c.category === filterCategory)?.waves.map((w: any) => (
                <div key={w.label} className="bg-white/80 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white shadow-xl">
                  <h4 className="font-black text-xl mb-8 flex items-center gap-3 text-blue-600"><Calendar className="text-blue-400" /> {w.label}</h4>
                  <div className="space-y-6">{w.items.map((i: any) => <div key={i.label} className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{i.label}</label><input type="text" value={i.date} onChange={e => updateTimelineItem(filterCategory, w.label, i.label, e.target.value)} className="w-full bg-slate-50/80 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-black text-slate-700 outline-none focus:bg-white focus:border-blue-100 transition-all" /></div>)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODUL MEDIA (DUMMY) */}
        {activeTab === "Media" && (
          <div className="py-32 text-center bg-white/40 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-300 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"><ImageIcon size={48} /></div>
            <h3 className="text-3xl font-black text-slate-800">Media Assets Manager</h3>
            <p className="text-slate-500 font-medium mt-3 max-w-sm mx-auto text-lg leading-relaxed">Kelola semua gambar banner dan foto galeri di sini. Sedang dalam tahap penyempurnaan.</p>
          </div>
        )}
      </main>

      {/* ================= MODALS & TOASTS ================= */}
      
      {/* Detail Slide-out */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-md">
          <div className="flex-1" onClick={() => setSelectedParticipant(null)}></div>
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-12 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500 rounded-l-[3rem]">
            <div className="flex justify-between items-center mb-12"><h2 className="text-2xl font-black text-slate-800">Profil Administrasi</h2><button onClick={() => setSelectedParticipant(null)} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"><X /></button></div>
            <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-[2rem] flex items-center justify-center text-5xl font-black mb-8 shadow-2xl shadow-blue-200 border-4 border-white">{(selectedParticipant.full_name || "P")[0]}</div>
            <h3 className="text-3xl font-black text-slate-900">{selectedParticipant.full_name}</h3>
            <p className="text-blue-600 font-black text-lg mt-1 tracking-tight">{selectedParticipant.competition_type}</p>
            <div className="mt-10 space-y-6">
              <DetailItem label="Email" value={selectedParticipant.email} />
              <DetailItem label="Sekolah" value={selectedParticipant.school_name || "-"} />
              <DetailItem label="Status Pembayaran" value={selectedParticipant.payment_status} />
              <div className="pt-10 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Promosikan Tahap Peserta</h4>
                <div className="grid grid-cols-3 gap-3">{[1, 2, 3].map(s => <button key={s} onClick={() => handleUpdateStage(selectedParticipant.id, s)} className={`py-5 rounded-2xl font-black text-sm border-2 transition-all ${JSON.parse(selectedParticipant.notes || '{}').current_stage === s ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-100'}`}>TAHAP {s}</button>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed top-10 right-10 z-[100] transition-all duration-700 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.5rem] p-5 flex items-center gap-4 min-w-[320px]">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{toast.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}</div>
          <div><p className="font-black text-slate-800 text-sm">{toast.type === 'success' ? 'Berhasil' : 'Error'}</p><p className="text-slate-500 text-xs font-bold mt-0.5">{toast.message}</p></div>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-white">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Shield size={40} /></div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">{confirmModal.title}</h3>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm">{confirmModal.message}</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">Batal</button>
                <button onClick={confirmModal.onConfirm} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200">Konfirmasi</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-100"
  };
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/20 group hover:scale-[1.03] transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colors[color]}`}>{React.cloneElement(icon, { size: 28 })}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <h2 className="text-3xl font-black text-slate-800 mt-1">{value}</h2>
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div className="p-5 bg-slate-50/50 rounded-2xl border border-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-black text-slate-700">{value || "-"}</p>
    </div>
  );
}
