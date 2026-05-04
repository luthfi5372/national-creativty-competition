"use client";

import React, { useState, useEffect, useRef } from "react";
import * as htmlToImage from 'html-to-image';
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; 
import { 
  LayoutDashboard, Users, FileCheck, Settings, 
  Download, Calendar, Bell, MoreHorizontal, Search, Filter, Printer, X, IdCard, Megaphone, Send,
  CheckCircle2, AlertCircle, LogOut, Trash2, MapPin, Target, XCircle, Power, Shield, Clock, CalendarDays, FolderOpen, ShieldCheck, CheckCircle, FileText, ImageIcon, Camera, Trophy, Medal, ClipboardCheck, Save, Sparkles, ArrowRight, Zap
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("LKTI Nasional");
  const [selectedParticipant, setSelectedParticipant] = useState<any | null>(null);
  const [selectedIdCard, setSelectedIdCard] = useState<any | null>(null);
  
  // --- STATE KENDALI ---
  const [isSavingTimeline, setIsSavingTimeline] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const idCardRef = useRef<HTMLDivElement>(null);

  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<any[]>([]);
  const [phaseStatus, setPhaseStatus] = useState<any[]>([]);
  const [waves, setWaves] = useState<any[]>([]);

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
        setSubmissionStatus(p.submissionStatus || []);
        setWaves(p.waves || []);
        setPhaseStatus(p.phaseStatus || []);
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
  const syncSettings = async (updatedData: any) => {
    await supabase.from('announcements').update({ content: JSON.stringify(updatedData) }).eq('title', 'SYS_PORTAL_SETTINGS');
  };

  const saveTimeline = async () => {
    setIsSavingTimeline(true);
    await supabase.from('announcements').upsert({ type: 'SYSTEM_TIMELINE', content: JSON.stringify(timelineData), title: 'Master Schedule Config' }, { onConflict: 'type' });
    showToast('Jadwal diperbarui secara global!', 'success');
    setIsSavingTimeline(false);
  };

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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg"></div></div>;

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden relative">
      {/* Visual background layers */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Sidebar Liquid Glass */}
      <aside className="w-72 bg-white/70 backdrop-blur-3xl border-r border-white/60 flex flex-col z-30 shadow-2xl">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-200/50 ring-4 ring-blue-50">
            <ShieldCheck className="text-white" size={26} />
          </div>
          <div><h1 className="font-black text-2xl tracking-tighter text-slate-900">NCC HQ</h1><p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Command Center</p></div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {[
            { id: "Dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
            { id: "Peserta", icon: <Users size={20} />, label: "Buku Peserta" },
            { id: "Verifikasi", icon: <CheckCircle size={20} />, label: "Verifikasi", count: realEntries.filter(e => e.payment_status === 'Pending').length },
            { id: "Kegiatan", icon: <CalendarDays size={20} />, label: "Kegiatan" },
            { id: "Schedule", icon: <Calendar size={20} />, label: "Schedule Lomba" },
            { id: "Media", icon: <ImageIcon size={20} />, label: "Kelola Media" },
            { id: "Pengaturan", icon: <Settings size={20} />, label: "Pengaturan" }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm transition-all duration-500 group ${activeTab === item.id ? "bg-blue-600 text-white shadow-2xl shadow-blue-200 translate-x-1" : "text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-md"}`}>
              <div className="flex items-center gap-4">{item.icon} {item.label}</div>
              {item.count ? <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${activeTab === item.id ? 'bg-white/20' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>{item.count}</span> : null}
            </button>
          ))}
        </nav>
        
        <div className="p-6"><button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all border border-rose-100"><LogOut size={18} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div className="animate-in fade-in slide-in-from-left duration-700"><h1 className="text-4xl font-black text-slate-900 tracking-tighter">{activeTab}</h1><p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Markas Besar NCC 13th / Jombang</p></div>
          <div className="flex gap-4">
             <button className="flex items-center gap-3 bg-white/80 backdrop-blur-md text-slate-800 border border-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all"><Bell size={18} /> Notifikasi</button>
             <button className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-2xl shadow-blue-200 hover:scale-105 transition-all"><Download size={18} /> Export Data Master</button>
          </div>
        </header>

        {/* ================= TABS CONTENT ================= */}
        
        {activeTab === "Dashboard" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StatCard title="Total Pendaftar" value={realEntries.length} icon={<Users />} color="blue" subtitle="Live Data" />
              <StatCard title="Terverifikasi" value={realEntries.filter(e => e.payment_status === 'Verified').length} icon={<ShieldCheck />} color="emerald" subtitle="Sudah Bayar" />
              <StatCard title="Antrean Verif" value={realEntries.filter(e => e.payment_status === 'Pending').length} icon={<Clock />} color="amber" subtitle="Butuh Konfirmasi" />
              <StatCard title="Total Kategori" value="4" icon={<Zap />} color="indigo" subtitle="Aktif" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] h-[450px]">
                <div className="flex justify-between items-center mb-10"><h3 className="font-black text-xl flex items-center gap-3 text-slate-800"><Sparkles className="text-blue-500" /> Analisis Tren</h3><div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">Statistik 7 Hari</div></div>
                <ResponsiveContainer width="100%" height="80%"><AreaChart data={dynamicChartData}><defs><linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold'}} /><Area type="monotone" dataKey="pendaftar" stroke="#3b82f6" strokeWidth={6} fillOpacity={1} fill="url(#colorP)" /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] h-[450px]">
                <div className="flex justify-between items-center mb-10"><h3 className="font-black text-xl flex items-center gap-3 text-slate-800"><Target className="text-indigo-500" /> Distribusi Bidang</h3><div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase">Semua Lomba</div></div>
                <ResponsiveContainer width="100%" height="80%"><BarChart data={dynamicBarData}><Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold'}} /><Bar dataKey="total" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={40} /></BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Peserta" && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-[3.5rem] border border-white shadow-2xl overflow-hidden animate-in fade-in duration-700">
            <div className="p-10 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-8 bg-white/30">
              <div className="relative w-full xl:w-[500px] group"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} /><input type="text" placeholder="Cari nama, email, atau asal sekolah..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-50 rounded-[1.5rem] text-sm font-black outline-none focus:border-blue-100 focus:shadow-inner transition-all shadow-sm" /></div>
              <div className="flex flex-wrap gap-3 w-full xl:w-auto">{["LKTI Nasional", "Olimpiade MIPA", "MTQ", "Speech Contest"].map(c => <button key={c} onClick={() => setFilterCategory(c)} className={`px-7 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${filterCategory === c ? "bg-slate-900 text-white shadow-2xl" : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"}`}>{c}</button>)}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-slate-50/50 text-slate-400 font-black text-[11px] uppercase tracking-[0.25em]"><th className="p-10">ID Entry</th><th className="p-10">Peserta & Kontak</th><th className="p-10">Institusi</th><th className="p-10">Progress</th><th className="p-10">Tindakan</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {realEntries.filter(e => filterCategory === "All" || e.competition_type === filterCategory).filter(e => e.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-blue-50/40 transition-all cursor-pointer group" onClick={() => setSelectedParticipant(e)}>
                      <td className="p-10"><span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black text-xs border border-blue-100">NCC-13-{e.id}</span></td>
                      <td className="p-10"><div><p className="font-black text-slate-900 text-lg leading-tight">{e.full_name}</p><p className="text-xs text-slate-400 font-bold mt-1.5">{e.email}</p></div></td>
                      <td className="p-10 font-bold text-slate-600 italic">“{e.school_name || "Personal Entry"}”</td>
                      <td className="p-10">{(() => { let s = 1; try { s = JSON.parse(e.notes).current_stage || 1; } catch(err) {} return <div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full animate-pulse ${s === 3 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-blue-600 shadow-[0_0_10px_#2563eb]'}`}></div><span className="font-black text-sm tracking-tight">TAHAP {s}</span></div>; })()}</td>
                      <td className="p-10"><button className="p-4 bg-white shadow-md rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ArrowRight size={22} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Kegiatan" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner ring-8 ${isRegistrationOpen ? 'bg-emerald-50 text-emerald-600 ring-emerald-50/50' : 'bg-rose-50 text-rose-600 ring-rose-50/50'}`}><Power size={40} /></div>
                <div><h3 className="text-3xl font-black text-slate-900 tracking-tight">Gerbang Registrasi Utama</h3><p className="font-bold text-slate-500 mt-2 text-lg">{isRegistrationOpen ? 'Sistem sedang aktif menerima pendaftaran baru.' : 'Pendaftaran ditutup sementara oleh pusat komando.'}</p></div>
              </div>
              <button onClick={() => { setIsRegistrationOpen(!isRegistrationOpen); showToast(`Portal ${!isRegistrationOpen ? 'Dibuka' : 'Ditutup'}!`, "success"); }} className={`w-28 h-14 rounded-full transition-all duration-500 relative p-2 shadow-inner ${isRegistrationOpen ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300 shadow-slate-100'}`}><div className={`w-10 h-10 bg-white rounded-full shadow-2xl transition-transform duration-500 ${isRegistrationOpen ? 'translate-x-12' : 'translate-x-0'}`} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white shadow-xl">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-slate-800"><CalendarDays className="text-blue-600" size={28} /> Wave Pendaftaran</h3>
                  <div className="space-y-5">{waves.map(w => <div key={w.id} className="flex justify-between items-center p-8 bg-white/50 rounded-3xl border-2 border-slate-50 shadow-sm"><p className="font-black text-slate-800 text-lg">{w.name}</p><button onClick={() => { setWaves(prev => prev.map(wi => wi.id === w.id ? {...wi, status: wi.status === 'Aktif' ? 'Tutup' : 'Aktif'} : wi)); showToast(`${w.name} ${w.status === 'Aktif' ? 'Ditutup' : 'Diaktifkan'}`, "success"); }} className={`px-8 py-3 rounded-2xl text-xs font-black tracking-[0.2em] transition-all ${w.status === 'Aktif' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200' : 'bg-slate-100 text-slate-400 border'}`}>{w.status.toUpperCase()}</button></div>)}</div>
               </div>
               <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white shadow-xl">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-slate-800"><Trophy className="text-amber-500" size={28} /> Tahapan Akses Peserta</h3>
                  <div className="grid grid-cols-1 gap-5">{phaseStatus.map(p => <button key={p.id} onClick={() => { setPhaseStatus(prev => prev.map(pi => pi.id === p.id ? {...pi, isOpen: !pi.isOpen} : pi)); showToast(`${p.name} diperbarui!`, "success"); }} className={`p-8 rounded-[2rem] border-4 transition-all text-left flex items-center justify-between group ${p.isOpen ? 'bg-blue-50/50 border-blue-500/20' : 'bg-white border-slate-50 hover:border-blue-100'}`}><div className="flex items-center gap-6"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${p.isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>{p.id.slice(-1)}</div><div><span className={`font-black text-xl tracking-tighter block ${p.isOpen ? 'text-blue-900' : 'text-slate-300'}`}>TAHAP {p.id.slice(-1)}</span><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.name}</span></div></div>{p.isOpen ? <CheckCircle className="text-blue-600" size={28} /> : <div className="w-8 h-8 border-4 border-slate-50 rounded-full" />}</button>)}</div>
               </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white shadow-2xl">
              <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-slate-800"><Settings className="text-indigo-600" size={28} /> Kontrol Portal Upload Karya</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {submissionStatus.map(s => (
                  <div key={s.id} className="p-8 bg-white/50 border-2 border-slate-50 rounded-[2.5rem] shadow-sm hover:border-blue-100 transition-all group">
                    <div className="flex justify-between items-center mb-6"><p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">{s.name}</p><button onClick={() => { setSubmissionStatus(prev => prev.map(si => si.id === s.id ? {...si, isOpen: !si.isOpen} : si)); showToast(`${s.name} ${!s.isOpen ? 'Dibuka' : 'Ditutup'}`, "success"); }} className={`w-10 h-5 rounded-full transition-all ${s.isOpen ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform mt-0.5 ml-0.5 ${s.isOpen ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl"><button onClick={() => { setSubmissionStatus(prev => prev.map(si => si.id === s.id ? {...si, mode: 'Manual'} : si)); showToast(`${s.name} Mode: Manual`, "success"); }} className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all ${s.mode === 'Manual' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>MANUAL</button><button onClick={() => { setSubmissionStatus(prev => prev.map(si => si.id === s.id ? {...si, mode: 'Auto'} : si)); showToast(`${s.name} Mode: Auto`, "success"); }} className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all ${s.mode === 'Auto' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>AUTO</button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Schedule" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-16 rounded-[4rem] text-white shadow-3xl flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden ring-[20px] ring-white/50 border border-white/10">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10 text-center md:text-left"><h2 className="text-5xl font-black tracking-tighter leading-none mb-4">Master Timeline</h2><p className="text-blue-300/80 font-black text-sm uppercase tracking-[0.4em]">Sinkronisasi Jadwal Kompetisi NCC 13th</p></div>
               <button onClick={saveTimeline} className="relative z-10 bg-blue-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-lg flex items-center gap-4 shadow-3xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all">{isSavingTimeline ? <Clock className="animate-spin" /> : <Save size={24} />} UPDATE JADWAL GLOBAL</button>
            </div>
            
            <div className="flex flex-wrap gap-4">{["LKTI Nasional", "Olimpiade MIPA", "MTQ", "Speech Contest"].map(c => <button key={c} onClick={() => setFilterCategory(c)} className={`px-10 py-5 rounded-[2rem] font-black text-xs tracking-[0.2em] transition-all ${filterCategory === c ? "bg-white text-blue-600 shadow-2xl ring-4 ring-blue-50" : "bg-white/40 text-slate-400 hover:bg-white"}`}>{c.toUpperCase()}</button>)}</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {timelineData?.length > 0 && timelineData.find(c => c.category === filterCategory)?.waves?.map((w: any) => (
                <div key={w.label} className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] border border-white shadow-2xl">
                  <div className="flex items-center gap-5 mb-12"><div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Calendar size={32} /></div><h4 className="font-black text-2xl text-slate-900 tracking-tight">{w.label}</h4></div>
                  <div className="space-y-8">{w.items.map((i: any) => <div key={i.label} className="group"><label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block mb-3 group-focus-within:text-blue-600 transition-colors">{i.label}</label><input type="text" value={i.date} onChange={e => { const newData = timelineData.map(c => c.category === filterCategory ? { ...c, waves: c.waves.map((wv:any) => wv.label === w.label ? { ...wv, items: wv.items.map((it:any) => it.label === i.label ? { ...it, date: e.target.value } : it) } : wv) } : c); setTimelineData(newData); }} className="w-full bg-slate-50/50 border-4 border-transparent rounded-[2rem] px-10 py-6 text-base font-black text-slate-800 outline-none focus:bg-white focus:border-blue-50 shadow-inner focus:shadow-none transition-all" /></div>)}</div>
                </div>
              ))}
              {(!timelineData || timelineData.length === 0) && <div className="col-span-full py-20 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-slate-200 font-black text-slate-300">MEMUAT DATA JADWAL...</div>}
            </div>
          </div>
        )}

        {/* MODAL & TOASTS */}
        
        {selectedParticipant && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-lg animate-in fade-in duration-500">
            <div className="flex-1" onClick={() => setSelectedParticipant(null)}></div>
            <div className="w-full max-w-xl bg-white h-full shadow-[-30px_0_60px_rgba(0,0,0,0.1)] p-16 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-700 rounded-l-[5rem] border-l-[15px] border-blue-50">
              <div className="flex justify-between items-center mb-16"><h2 className="text-3xl font-black text-slate-900 tracking-tighter">Profil Administrasi</h2><button onClick={() => setSelectedParticipant(null)} className="p-4 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X size={24} /></button></div>
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-[3rem] flex items-center justify-center text-6xl font-black mb-10 shadow-3xl shadow-blue-200 border-8 border-white ring-4 ring-blue-50">{(selectedParticipant.full_name || "P")[0]}</div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedParticipant.full_name}</h3>
              <p className="text-blue-600 font-black text-xl mt-2 flex items-center gap-3"><Zap size={20} /> {selectedParticipant.competition_type}</p>
              <div className="mt-12 space-y-6">
                <DetailItem label="Email Komunikasi" value={selectedParticipant.email} />
                <DetailItem label="Institusi / Sekolah" value={selectedParticipant.school_name || "Personal Entry"} />
                <DetailItem label="Status Akun" value={selectedParticipant.payment_status} color={selectedParticipant.payment_status === 'Verified' ? 'emerald' : 'amber'} />
                <div className="pt-12 border-t-4 border-slate-50">
                  <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-10 text-center">Tingkatkan Tahapan Peserta</h4>
                  <div className="grid grid-cols-3 gap-5">{[1, 2, 3].map(s => <button key={s} onClick={() => { handleUpdateStage(selectedParticipant.id, s); setSelectedParticipant(null); }} className={`py-8 rounded-[2.5rem] font-black text-base border-4 transition-all ${JSON.parse(selectedParticipant.notes || '{}').current_stage === s ? 'bg-blue-600 border-blue-100 text-white shadow-3xl scale-110' : 'bg-white border-slate-50 text-slate-400 hover:border-blue-50'}`}>TAHAP {s}</button>)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast */}
        <div className={`fixed top-12 right-12 z-[100] transition-all duration-1000 transform ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
          <div className="bg-white/90 backdrop-blur-3xl border-4 border-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-8 flex items-center gap-6 min-w-[400px]">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{toast.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}</div>
            <div><p className="font-black text-slate-900 text-xl tracking-tighter">{toast.type === 'success' ? 'Berhasil!' : 'Peringatan'}</p><p className="text-slate-500 text-sm font-bold mt-1 leading-relaxed">{toast.message}</p></div>
          </div>
        </div>

        {/* Premium Confirm Modal */}
        {confirmModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-500">
             <div className="bg-white rounded-[5rem] p-20 max-w-xl w-full text-center shadow-3xl animate-in zoom-in-95 duration-500 border-[15px] border-white ring-1 ring-slate-200">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner ring-8 ring-blue-50/50"><Shield size={48} /></div>
                <h3 className="text-4xl font-black text-slate-900 mb-5 tracking-tighter">{confirmModal.title}</h3>
                <p className="text-slate-500 font-bold mb-12 leading-relaxed text-lg">{confirmModal.message}</p>
                <div className="flex gap-6">
                  <button onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} className="flex-1 py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-base hover:bg-slate-200 transition-all">Batalkan</button>
                  <button onClick={confirmModal.onConfirm} className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-base shadow-3xl shadow-blue-200 hover:scale-105 transition-all">Konfirmasi</button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: any) {
  const colors: any = {
    blue: "bg-blue-600 text-white shadow-blue-200",
    emerald: "bg-emerald-500 text-white shadow-emerald-200",
    amber: "bg-amber-500 text-white shadow-amber-200",
    indigo: "bg-indigo-600 text-white shadow-indigo-200"
  };
  const iconColors: any = {
    blue: "bg-blue-500", emerald: "bg-emerald-400", amber: "bg-amber-400", indigo: "bg-indigo-500"
  };
  return (
    <div className={`p-8 rounded-[3rem] border border-white/20 shadow-2xl group hover:scale-105 transition-all duration-500 flex flex-col items-center text-center ${colors[color]}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${iconColors[color]}`}>{React.cloneElement(icon, { size: 32 })}</div>
      <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.3em] mb-2">{title}</p>
      <h2 className="text-4xl font-black tracking-tighter mb-1">{value}</h2>
      <p className="text-[10px] font-bold opacity-60 uppercase">{subtitle}</p>
    </div>
  );
}

function DetailItem({ label, value, color }: any) {
  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100"
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${color ? colors[color] : 'bg-slate-50/50 border-slate-50'}`}>
      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className="font-black text-xl tracking-tight">{value || "-"}</p>
    </div>
  );
}
