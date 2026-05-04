"use client";

import React, { useState, useEffect, useRef } from "react";
import * as htmlToImage from 'html-to-image';
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; 
import { 
  LayoutDashboard, Users, FileCheck, Settings, 
  Download, Calendar, Bell, MoreHorizontal, Search, Filter, Printer, X, IdCard, Megaphone, Send,
  CheckCircle2, AlertCircle, LogOut, Trash2, MapPin, Target, XCircle, Power, Shield, Clock, CalendarDays, FolderOpen, ShieldCheck, CheckCircle, FileText, ImageIcon, Camera, Trophy, Medal, ClipboardCheck, Save
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
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
        { label: "Gelombang I", items: [
          { label: "Pendaftaran & Abstrak", date: "16 Juli – 3 September" },
          { label: "Pengumuman Tahap I", date: "10 September" },
          { label: "Pengumpulan Fullpaper", date: "12 – 18 September" },
          { label: "Pengumuman Tahap II", date: "26 September" }
        ]},
        { label: "Gelombang II", items: [
          { label: "Pendaftaran & Abstrak", date: "1 – 25 Oktober" },
          { label: "Pengumuman Tahap I", date: "31 Oktober" },
          { label: "Pengumpulan Fullpaper", date: "1 – 9 November" },
          { label: "Pengumuman Tahap II", date: "16 November" }
        ]}
      ]
    },
    {
      category: "Olimpiade MIPA",
      waves: [
        { label: "Gelombang I", items: [
          { label: "Pendaftaran", date: "16 Juli – 3 September" },
          { label: "Seleksi 1", date: "10 September" },
          { label: "Seleksi 2", date: "14 September" },
          { label: "Pengumuman Tahap I", date: "21 September" }
        ]},
        { label: "Gelombang II", items: [
          { label: "Pendaftaran", date: "1 – 25 Oktober" },
          { label: "Simulasi", date: "29 Oktober" },
          { label: "Seleksi", date: "2 November" },
          { label: "Pengumuman", date: "8 November" }
        ]}
      ]
    },
    {
      category: "Speech Contest",
      waves: [
        { label: "Gelombang I", items: [{ label: "Pendaftaran & Naskah", date: "16 Juli – 3 September" }, { label: "Pengumuman", date: "14 September" }] },
        { label: "Gelombang II", items: [{ label: "Pendaftaran & Naskah", date: "1 – 25 Oktober" }, { label: "Pengumuman", date: "14 November" }] }
      ]
    },
    {
      category: "MTQ",
      waves: [
        { label: "Gelombang I", items: [{ label: "Pendaftaran & Video", date: "16 Juli – 3 September" }, { label: "Pengumuman", date: "14 September" }] },
        { label: "Gelombang II", items: [{ label: "Pendaftaran", date: "1 – 25 Oktober" }, { label: "Pengumuman", date: "14 November" }] }
      ]
    }
  ]);

  const [submissionStatus, setSubmissionStatus] = useState([
    { id: 'mipa_g1', name: 'Olimpiade MIPA (Gel. I)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'mipa_g2', name: 'Olimpiade MIPA (Gel. II)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'speech_g1', name: 'Speech Contest (Gel. I)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'speech_g2', name: 'Speech Contest (Gel. II)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'lkti_g1', name: 'LKTI Nasional (Gel. I)', isOpen: true, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'lkti_g2', name: 'LKTI Nasional (Gel. II)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'mtq_g1', name: 'MTQ (Gel. I)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
    { id: 'mtq_g2', name: 'MTQ (Gel. II)', isOpen: false, openAt: "", closeAt: "", mode: "Manual" },
  ]);

  const [phaseStatus, setPhaseStatus] = useState([
    { id: 'tahap1', name: 'Tahap 1: Penyisihan', isOpen: true },
    { id: 'tahap2', name: 'Tahap 2: Semi Final', isOpen: false },
    { id: 'tahap3', name: 'Tahap 3: Grand Final', isOpen: false },
  ]);

  const [waves, setWaves] = useState([
    { id: 1, name: "Gelombang 1 (Early Bird)", status: "Aktif", startDate: "2026-07-16", endDate: "2026-09-03" },
    { id: 2, name: "Gelombang 2 (Regular)", status: "Segera", startDate: "2026-10-01", endDate: "2026-10-25" },
  ]);

  const [dashboardAssets, setDashboardAssets] = useState<any>({
    hero_banner: "",
    card_buku_panduan: "",
    card_twibbon: "",
    card_kontak: "",
    gallery_title: "Moments of Excellence",
    gallery_subtitle: "A glimpse into the spirit, competition, and victory at NCC.",
    gallery_images: []
  });

  // --- UI STATE ---
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: "", message: "", onConfirm: () => {} });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, userId: null, name: "" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000); 
  };

  // --- DATA FETCHING & RADAR ---
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
        if (p.dashboardAssets) setDashboardAssets(p.dashboardAssets);
      }
      setIsLoading(false);
    };
    fetchInitialData();

    const radar = supabase.channel('hq_radar').on('postgres_changes', { event: '*', schema: 'public', table: 'competition_entries' }, () => fetchInitialData()).subscribe();
    return () => { supabase.removeChannel(radar); };
  }, []);

  // --- ANALYTICS ENGINE ---
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

  // --- LOGIC HANDLERS ---
  const saveTimeline = async () => {
    setIsSavingTimeline(true);
    await supabase.from('announcements').upsert({ type: 'SYSTEM_TIMELINE', content: JSON.stringify(timelineData), title: 'Master Schedule Config' }, { onConflict: 'type' });
    showToast('Jadwal diperbarui secara global!', 'success');
    setIsSavingTimeline(false);
  };

  const updateTimelineItem = (catName: string, waveLabel: string, itemLabel: string, newDate: string) => {
    setTimelineData(prev => prev.map(c => c.category === catName ? { ...c, waves: c.waves.map((w:any) => w.label === waveLabel ? { ...w, items: w.items.map((i:any) => i.label === itemLabel ? { ...i, date: newDate } : i) } : w) } : c));
  };

  const syncSettings = async () => {
    await supabase.from('announcements').update({ content: JSON.stringify({ waves, submissionStatus, phaseStatus, dashboardAssets }) }).eq('title', 'SYS_PORTAL_SETTINGS');
  };

  useEffect(() => { if (!isLoading) syncSettings(); }, [waves, submissionStatus, phaseStatus, dashboardAssets]);

  const handleUpdateStatus = async (id: any, newStatus: string) => {
    await supabase.from('competition_entries').update({ payment_status: newStatus }).eq('id', id);
    setRealEntries(prev => prev.map(e => e.id === id ? { ...e, payment_status: newStatus } : e));
    showToast(`Status peserta #${id} menjadi ${newStatus}`, "success");
  };

  const handleUpdateStage = async (id: any, stage: number) => {
    const entry = realEntries.find(e => e.id === id);
    let notes = {}; try { notes = JSON.parse(entry.notes); } catch(e) {}
    const newNotes = JSON.stringify({ ...notes, current_stage: stage });
    await supabase.from('competition_entries').update({ notes: newNotes }).eq('id', id);
    setRealEntries(prev => prev.map(e => e.id === id ? { ...e, notes: newNotes } : e));
    if (selectedParticipant) setSelectedParticipant((p:any) => ({ ...p, notes: newNotes }));
    showToast(`Tahap peserta #${id} diperbarui`, "success");
  };

  const handleDownloadCard = async () => {
    if (!idCardRef.current) return;
    setIsDownloadingCard(true);
    const dataUrl = await htmlToImage.toPng(idCardRef.current, { quality: 1, pixelRatio: 2 });
    const link = document.createElement('a'); link.href = dataUrl; link.download = `ID_NCC_${selectedIdCard.full_name}.png`; link.click();
    setIsDownloadingCard(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <aside className="w-72 bg-white border-r flex flex-col z-20 shadow-sm">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck className="text-white" /></div>
          <div><h1 className="font-black text-xl">NCC HQ.</h1><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Command Center</p></div>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {[
            { id: "Dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
            { id: "Peserta", icon: <Users size={18} />, label: "Buku Peserta" },
            { id: "Verifikasi", icon: <CheckCircle size={18} />, label: "Verifikasi" },
            { id: "Kegiatan", icon: <CalendarDays size={18} />, label: "Kegiatan" },
            { id: "Schedule", icon: <Calendar size={18} />, label: "Schedule Lomba" },
            { id: "Media", icon: <ImageIcon size={18} />, label: "Media" },
            { id: "Pengaturan", icon: <Settings size={18} />, label: "Pengaturan" }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === item.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6"><button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div><h1 className="text-2xl font-bold text-slate-900">{activeTab}</h1><p className="text-slate-500 text-sm">Pusat kendali Markas Besar NCC 13th.</p></div>
          <button onClick={() => {
            const csv = realEntries.map(e => `${e.full_name},${e.email},${e.competition_type},${e.payment_status}`).join('\n');
            const b = new Blob([`Nama,Email,Kategori,Status\n${csv}`], { type: 'text/csv' });
            const u = URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = 'Data_NCC.csv'; l.click();
          }} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md"><Download size={18} /> Export Data</button>
        </header>

        {/* ================= CONTENT TABS ================= */}
        {activeTab === "Dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Pendaftar" value={realEntries.length.toString()} trend="Live" isUp={true} />
              <StatCard title="Terverifikasi" value={realEntries.filter(e => e.payment_status === 'Verified').length.toString()} trend="Safe" isUp={true} />
              <StatCard title="Pending" value={realEntries.filter(e => e.payment_status === 'Pending').length.toString()} trend="Action" isUp={false} />
              <StatCard title="Estimasi IDR" value={(realEntries.length * 150000).toLocaleString()} trend="Gross" isUp={true} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border shadow-sm h-80">
                <h3 className="font-bold mb-4">Tren Pendaftaran</h3>
                <ResponsiveContainer width="100%" height="90%"><LineChart data={dynamicChartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="pendaftar" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-3xl border shadow-sm h-80">
                <h3 className="font-bold mb-4">Peminat Kategori</h3>
                <ResponsiveContainer width="100%" height="90%"><BarChart data={dynamicBarData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Peserta" && (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="relative w-96"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input type="text" placeholder="Cari peserta..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm outline-none" /></div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-bold outline-none"><option value="All">Semua Kategori</option><option value="LKTI Nasional">LKTI Nasional</option><option value="Olimpiade MIPA">Olimpiade MIPA</option><option value="Speech Contest">Speech Contest</option><option value="MTQ">MTQ</option></select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]"><tr><th className="p-6">ID</th><th className="p-6">Profil</th><th className="p-6">Sekolah</th><th className="p-6">Progres</th><th className="p-6">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {realEntries.filter(e => filterCategory === "All" || e.competition_type === filterCategory).filter(e => e.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                    <tr key={e.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedParticipant(e)}>
                      <td className="p-6 font-bold text-blue-600">NCC-{e.id}</td>
                      <td className="p-6"><div><p className="font-bold">{e.full_name}</p><p className="text-xs text-slate-500">{e.email}</p></div></td>
                      <td className="p-6 font-medium">{e.school_name || "-"}</td>
                      <td className="p-6">{(() => { let s = 1; try { s = JSON.parse(e.notes).current_stage || 1; } catch(e) {} return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded font-black text-[10px]">T{s}</span>; })()}</td>
                      <td className="p-6 flex gap-2"><button onClick={(ev) => { ev.stopPropagation(); setSelectedIdCard(e); }} className="p-2 bg-slate-100 rounded-lg"><IdCard size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Verifikasi" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {realEntries.filter(e => e.payment_status === 'Pending').length === 0 ? <div className="p-12 text-center text-slate-400">Antrean Verifikasi Kosong</div> : 
              realEntries.filter(e => e.payment_status === 'Pending').map(e => (
                <div key={e.id} className="bg-white p-6 rounded-3xl border flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">{e.full_name[0]}</div>
                    <div><p className="font-bold">{e.full_name}</p><p className="text-xs text-slate-500">{e.email}</p></div>
                  </div>
                  <div className="flex gap-2">
                    {e.payment_proof_url && <a href={e.payment_proof_url} target="_blank" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">Bukti</a>}
                    <button onClick={() => handleUpdateStatus(e.id, 'Verified')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs">Terima</button>
                    <button onClick={() => handleUpdateStatus(e.id, 'Rejected')} className="px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-xs">Tolak</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "Kegiatan" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isRegistrationOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}><Power size={28} /></div>
                <div><h3 className="text-xl font-black">Portal Pendaftaran</h3><p className="text-sm text-slate-500">{isRegistrationOpen ? 'Terbuka Umum' : 'Ditutup Sementara'}</p></div>
              </div>
              <button onClick={() => setIsRegistrationOpen(!isRegistrationOpen)} className={`w-20 h-10 rounded-full transition-all ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`w-8 h-8 bg-white rounded-full transition-transform ${isRegistrationOpen ? 'translate-x-10' : 'translate-x-1'}`} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-3xl border">
                  <h3 className="font-black mb-6">Gelombang Aktif</h3>
                  <div className="space-y-4">{waves.map(w => <div key={w.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><p className="font-bold">{w.name}</p><button onClick={() => setWaves(prev => prev.map(wi => wi.id === w.id ? {...wi, status: wi.status === 'Aktif' ? 'Tutup' : 'Aktif'} : wi))} className={`px-4 py-1.5 rounded-lg text-[10px] font-black ${w.status === 'Aktif' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{w.status}</button></div>)}</div>
               </div>
               <div className="bg-white p-8 rounded-3xl border">
                  <h3 className="font-black mb-6">Akses Tahap Lanjutan</h3>
                  <div className="grid grid-cols-3 gap-3">{phaseStatus.map(p => <button key={p.id} onClick={() => setPhaseStatus(prev => prev.map(pi => pi.id === p.id ? {...pi, isOpen: !pi.isOpen} : pi))} className={`p-4 rounded-2xl border font-black text-[10px] ${p.isOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{p.name}</button>)}</div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border">
              <h3 className="font-black mb-6">Upload Portal Control</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {submissionStatus.map(s => (
                  <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border">
                    <div className="flex justify-between items-center mb-3"><p className="text-xs font-bold">{s.name}</p><button onClick={() => setSubmissionStatus(prev => prev.map(si => si.id === s.id ? {...si, isOpen: !si.isOpen} : si))} className={`w-8 h-4 rounded-full ${s.isOpen ? 'bg-indigo-500' : 'bg-slate-200'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${s.isOpen ? 'translate-x-4' : 'translate-x-0.5'}`} /></button></div>
                    <div className="flex gap-1"><button onClick={() => updateSchedule(s.id, 'mode', 'Manual')} className={`flex-1 text-[8px] py-1 rounded ${s.mode === 'Manual' ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}>MANUAL</button><button onClick={() => updateSchedule(s.id, 'mode', 'Auto')} className={`flex-1 text-[8px] py-1 rounded ${s.mode === 'Auto' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>AUTO</button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Schedule" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div><h2 className="text-2xl font-black">Master Schedule Lomba</h2><p className="text-sm text-slate-500">Update tanggal timeline untuk semua dashboard peserta.</p></div>
              <button onClick={saveTimeline} className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 shadow-xl shadow-blue-100">{isSavingTimeline ? <Clock className="animate-spin" /> : <Save />} SIMPAN JADWAL</button>
            </div>
            <div className="bg-white p-3 rounded-2xl border flex flex-wrap gap-2">{["LKTI Nasional", "Olimpiade MIPA", "Speech Contest", "MTQ"].map(c => <button key={c} onClick={() => setFilterCategory(c)} className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${filterCategory === c ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}>{c}</button>)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {timelineData.find(c => c.category === filterCategory)?.waves.map((w: any) => (
                <div key={w.label} className="bg-white p-8 rounded-3xl border shadow-sm">
                  <h4 className="font-black mb-6 flex items-center gap-2 text-blue-600"><Calendar size={18} /> {w.label}</h4>
                  <div className="space-y-4">{w.items.map((i: any) => <div key={i.label}><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">{i.label}</label><input type="text" value={i.date} onChange={e => updateTimelineItem(filterCategory, w.label, i.label, e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100" /></div>)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Media" && (
          <div className="p-16 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"><Camera size={40} /></div>
            <h3 className="text-2xl font-black">Aset Visual & Media</h3>
            <p className="text-slate-500 mt-2">Modul pengelolaan banner sedang disiapkan.</p>
          </div>
        )}

        {activeTab === "Pengaturan" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl border"><Shield className="text-blue-600 mb-4" size={32} /><h4 className="font-bold">Keamanan</h4><p className="text-xs text-slate-500 mt-2">Kelola kata sandi HQ.</p></div>
            <div className="bg-white p-8 rounded-3xl border"><Clock className="text-amber-600 mb-4" size={32} /><h4 className="font-bold">Zona Waktu</h4><p className="text-xs text-slate-500 mt-2">WIB (UTC+7)</p></div>
            <div className="bg-white p-8 rounded-3xl border"><Target className="text-emerald-600 mb-4" size={32} /><h4 className="font-bold">Misi</h4><p className="text-xs text-slate-500 mt-2">NCC 13th Success.</p></div>
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
          <div className="flex-1" onClick={() => setSelectedParticipant(null)}></div>
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8"><h2 className="text-xl font-bold">Detail Peserta</h2><button onClick={() => setSelectedParticipant(null)}><X /></button></div>
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-black mb-6">{selectedParticipant.full_name[0]}</div>
            <h3 className="text-2xl font-bold">{selectedParticipant.full_name}</h3>
            <p className="text-blue-600 font-bold mb-8">{selectedParticipant.competition_type}</p>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase">Sekolah</p><p className="font-bold">{selectedParticipant.school_name || "-"}</p></div>
              <div className="p-4 bg-slate-50 rounded-2xl"><p className="text-[10px] font-black text-slate-400 uppercase">Kontak</p><p className="font-bold">{selectedParticipant.email}</p><p className="font-bold">{selectedParticipant.whatsapp_number || "-"}</p></div>
              <div className="mt-8 border-t pt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Promosikan Tahap</p>
                <div className="grid grid-cols-3 gap-2">{[1, 2, 3].map(s => <button key={s} onClick={() => handleUpdateStage(selectedParticipant.id, s)} className={`py-3 rounded-xl font-black text-xs border ${JSON.parse(selectedParticipant.notes || '{}').current_stage === s ? 'bg-blue-600 text-white' : 'bg-white'}`}>T{s}</button>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full relative">
            <button onClick={() => setSelectedIdCard(null)} className="absolute top-4 right-4"><X /></button>
            <div ref={idCardRef} className="bg-blue-900 p-8 rounded-2xl text-white text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black">{(selectedIdCard.full_name || "U")[0]}</div>
              <h3 className="text-xl font-bold">{selectedIdCard.full_name}</h3>
              <p className="text-blue-200 text-xs mt-1">{selectedIdCard.competition_type}</p>
              <div className="mt-6 pt-4 border-t border-white/10 font-mono text-xs">NCC-{selectedIdCard.id}</div>
            </div>
            <button onClick={handleDownloadCard} disabled={isDownloadingCard} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">{isDownloadingCard ? "Memproses..." : <><Download size={18} /> Download PNG</>}</button>
          </div>
        </div>
      )}

      <div className={`fixed top-8 right-8 z-[100] bg-white border shadow-2xl rounded-2xl p-4 flex items-center gap-3 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}</div>
        <p className="text-sm font-bold text-slate-800">{toast.message}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, isUp }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-black text-slate-800">{value}</h2>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>{isUp ? '↑' : '↓'} {trend}</div>
    </div>
  );
}
