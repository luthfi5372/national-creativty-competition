"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Lock, 
  Settings, 
  Users, 
  Activity, 
  Bell, 
  Power, 
  Send, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  UserCheck,
  Search,
  Filter,
  RefreshCcw,
  Edit2,
  Save,
  X as CloseIcon,
  Trash2,
  Download,
  Plus,
  Eye,
  FileText,
  QrCode,
  Layout,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AdminAnalytics from "@/components/AdminAnalytics";
import JuryLeaderboard from "@/components/JuryLeaderboard";
import { 
  fetchSiteSettings, 
  updateSiteSettings, 
  fetchAllEntriesHybrid, 
  adminUpdateCompetitionEntry,
  adminUpdatePaymentStatusToSupabase
} from "@/lib/supabase/service";
import { 
  addAdminLog,
  submitCompetitionEntry,
  deleteCompetitionEntry
} from "@/lib/localAuth";

// --- THEME CONSTANTS ---
const COLORS = {
  cyan: "#06b6d4",
  purple: "#6366f1",
  rose: "#f43f5e",
  emerald: "#10b981",
  amber: "#f59e0b",
  glass: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.1)"
};

export default function HQPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "participants" | "settings" | "studio" | "leaderboard">("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // --- MODAL STATES (from Legacy Dashboard) ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewProof, setViewProof] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    school: "",
    category: "Olimpiade MIPA",
    city: "Jakarta",
    teamSize: "1",
    notes: ""
  });

  // Load Initial Data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [settRes, entriesData] = await Promise.all([
      fetchSiteSettings(),
      fetchAllEntriesHybrid()
    ]);
    if (settRes.data) setSettings(settRes.data);
    if (entriesData) setEntries(entriesData);
    setIsLoading(false);
  }

  const handleToggleRegistration = async () => {
    const newVal = !settings.is_registration_open;
    const { error } = await updateSiteSettings({ is_registration_open: newVal });
    if (!error) {
       setSettings({ ...settings, is_registration_open: newVal });
    }
  };

  const handleUpdateStudio = async (updates: any) => {
    const { error } = await updateSiteSettings(updates);
    if (!error) {
      setSettings({ ...settings, ...updates });
      alert("Studio Configuration Updated! Live changes applied.");
    } else {
      alert("Failed to update studio: " + error);
    }
  };

  const handleUpdateAnnouncement = async (text: string) => {
    const { error } = await updateSiteSettings({ live_announcement: text });
    if (!error) {
      setSettings({ ...settings, live_announcement: text });
      alert("Pengumuman berhasil disuntikkan secara LIVE!");
    }
  };

  const handleInlineEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const saveInlineEdit = async () => {
    if (!editingId || !editForm) return;
    const { success } = await adminUpdateCompetitionEntry(editingId, editForm);
    if (success) {
      setEntries(entries.map(e => e.id === editingId ? editForm : e));
      setEditingId(null);
    }
  };

  // --- LEGACY HANDLERS (Merged from Phase 8) ---
  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const BOM = "\uFEFF";
    const headers = ["ID", "Nama", "Email", "WA", "Sekolah", "Kota", "Kategori", "Tipe", "Waktu", "Status"];
    const csvRows = [
      headers.join(","),
      ...entries.map(e => [
        `"NCC-${String(e.id).slice(0, 8).toUpperCase()}"`, 
        `"${e.fullName}"`, 
        `"${e.email}"`, 
        `"=""${e.phone}"""`,
        `"${e.school}"`,
        `"${e.city}"`,
        `"${e.category}"`,
        `"${e.team_size || e.teamSize || '1'}"`,
        `"${new Date(e.created_at || e.submittedAt).toLocaleString()}"`,
        `"${e.payment_status || e.paymentStatus}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([BOM + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NCC_Data_Master_${new Date().toLocaleDateString('id-ID')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addAdminLog(`Exported ${entries.length} participants to CSV`);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitCompetitionEntry({ ...formData, paymentStatus: "Verified" });
    if (res.success) {
      addAdminLog(`Manual Registration: ${formData.email}`);
      setShowAddModal(false);
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handleVerifyPayment = async (id: string) => {
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 500));
    const { success } = await adminUpdatePaymentStatusToSupabase(id, "Verified");
    if (success) {
      if (viewProof) {
        // Notify API Trigger (Phase 6 legacy)
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: viewProof.email, fullName: viewProof.fullName, type: 'VERIFIED' })
        }).catch(() => {});
      }
      setViewProof(null);
      loadData();
    }
    setIsVerifying(false);
  };

  const handleRejectPayment = async (id: string) => {
    if (confirm("Tolak bukti pembayaran ini?")) {
      const { success } = await adminUpdatePaymentStatusToSupabase(id, "Wait");
      if (success) {
        setViewProof(null);
        loadData();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data pendaftaran ini secara permanen?")) {
      const { success } = await deleteCompetitionEntry(id);
      if (success) {
        addAdminLog(`Deleted Entry ID: ${id}`);
        loadData();
      }
    }
  };

  // --- ANALYTICS DATA PREP ---
  const mappedEntries = entries.map(e => ({
    ...e,
    paymentStatus: e.payment_status || e.paymentStatus || "Wait",
    submittedAt: e.created_at || e.submittedAt || new Date().toISOString(),
    category: e.category
  }));

  const pieData = [
    { name: 'Olimpiade MIPA', value: entries.filter(e => e.category === 'Olimpiade MIPA').length || 0 },
    { name: 'Speech Contest', value: entries.filter(e => e.category === 'Speech Contest').length || 0 },
    { name: 'LKTI Nasional', value: entries.filter(e => e.category === 'LKTI Nasional').length || 0 },
    { name: 'MTQ Nasional', value: entries.filter(e => e.category === 'MTQ Nasional').length || 0 },
  ];

  // --- RENDER MAIN HQ ---
  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-24 bg-[#020617] border-r border-white/5 flex flex-col items-center py-10 gap-10">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-400">
          <Activity size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-6">
          <NavIcon icon={TrophyIcon} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavIcon icon={Users} active={activeTab === 'participants'} onClick={() => setActiveTab('participants')} />
          <NavIcon icon={Layout} active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} />
          <NavIcon icon={Trophy} active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
          <NavIcon icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>

        <button onClick={() => window.location.href = '/login'} className="p-3 text-white/40 hover:text-rose-500 transition-colors">
          <Power size={24} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[4px]">System Status: Online</p>
            </div>
            <h2 className="text-4xl font-black tracking-tight">
              NCC <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">COMMAND CENTER</span>
            </h2>
          </div>
          
          <div className="flex gap-4">
             <button onClick={handleExportCSV} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest text-slate-400">
                <Download size={16} /> Export CSV
             </button>
             <Link href="/admin/scanner" className="px-6 py-3 bg-indigo-600/20 border border-indigo-500/20 rounded-2xl flex items-center gap-2 hover:bg-indigo-600/30 transition-all font-bold text-[10px] uppercase tracking-widest text-indigo-400">
                <QrCode size={16} /> QR Scan
             </Link>
             <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-white text-black rounded-2xl flex items-center gap-2 hover:bg-slate-200 transition-all font-bold text-[10px] uppercase tracking-widest">
                <Plus size={16} /> Manual Entry
             </button>
             <button onClick={loadData} className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all">
                <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
             </button>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-8">
            {/* Quick Stats */}
            <div className="col-span-12 grid grid-cols-4 gap-6">
               <StatCard label="Pendaftar" value={entries.length} icon={Users} color="cyan" />
               <StatCard label="Terverifikasi" value={entries.filter(e => e.payment_status === 'Verified').length} icon={UserCheck} color="emerald" />
               <StatCard label="Menunggu" value={entries.filter(e => e.payment_status === 'Paid').length} icon={CreditCard} color="amber" />
               <StatCard label="Pendaftaran" value={settings?.is_registration_open ? "OPEN" : "CLOSED"} icon={Power} color={settings?.is_registration_open ? "emerald" : "rose"} />
            </div>

            {/* --- ENHANCED ANALYTICS (Merged from Phase 8) --- */}
            <div className="col-span-12">
               <AdminAnalytics entries={mappedEntries} />
            </div>

            {/* Graphs Grid */}
            <div className="col-span-8 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
               <h3 className="text-sm font-black uppercase tracking-[3px] text-white/40 mb-8 flex items-center gap-3">
                  <TrendingUp size={16} /> Registrasi Metrics
               </h3>
               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={entries.map((_, i) => ({ val: i + 1 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                        itemStyle={{ color: COLORS.cyan, fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="val" 
                        stroke={COLORS.cyan} 
                        strokeWidth={4} 
                        dot={false}
                        animationDuration={2000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="col-span-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
               <h3 className="text-sm font-black uppercase tracking-[3px] text-white/40 mb-8">Category Split</h3>
               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {/* Studio / CMS View */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Identity Control */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
               <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                  <h3 className="text-xl font-black mb-1 flex items-center gap-3">
                    <Shield className="text-cyan-400" size={24} /> Site Identity
                  </h3>
                  <p className="text-white/40 text-xs mb-8 uppercase tracking-widest font-bold">Branding & Hero Content</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Site Brand Name</label>
                       <input 
                        defaultValue={settings?.site_brand_name || "NCC 13th"}
                        id="site_brand_name"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-cyan-500 outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Site Main Title</label>
                       <input 
                        defaultValue={settings?.site_title || "National Creativity Competition"}
                        id="site_title"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-cyan-500 outline-none transition-all"
                       />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUpdateStudio({ 
                      site_brand_name: (document.getElementById('site_brand_name') as HTMLInputElement).value,
                      site_title: (document.getElementById('site_title') as HTMLInputElement).value
                    })}
                    className="mt-8 px-8 py-4 bg-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-900/20"
                  >
                    Save Identity Settings
                  </button>
               </div>

               {/* Financials / Bank Accounts */}
               <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                  <h3 className="text-xl font-black mb-1 flex items-center gap-3">
                    <CreditCard className="text-amber-400" size={24} /> Official Financials
                  </h3>
                  <p className="text-white/40 text-xs mb-8 uppercase tracking-widest font-bold">Bank Accounts for Participants</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Bank Name</label>
                       <input 
                        defaultValue={settings?.bank_name || "MANDIRI"}
                        id="bank_name"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Account Number</label>
                       <input 
                        defaultValue={settings?.bank_number || "1410-00-1234-567"}
                        id="bank_number"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold font-mono"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">A/N Holder</label>
                       <input 
                        defaultValue={settings?.bank_holder || "NCC Central"}
                        id="bank_holder"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold"
                       />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUpdateStudio({ 
                      bank_name: (document.getElementById('bank_name') as HTMLInputElement).value,
                      bank_number: (document.getElementById('bank_number') as HTMLInputElement).value,
                      bank_holder: (document.getElementById('bank_holder') as HTMLInputElement).value
                    })}
                    className="mt-8 px-8 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/20"
                  >
                    Update Bank Account
                  </button>
               </div>
            </div>

            {/* Contact & Support Section */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 h-full">
                  <h3 className="text-xl font-black mb-1 flex items-center gap-3">
                    <FileText className="text-purple-400" size={24} /> Support Center
                  </h3>
                  <p className="text-white/40 text-xs mb-8 uppercase tracking-widest font-bold">Contact Info & Links</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Official Email</label>
                       <input defaultValue={settings?.contact_email || "info@ncc2026.id"} id="contact_email" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">WhatsApp Number</label>
                       <input defaultValue={settings?.contact_phone || "0812-3456-7890"} id="contact_phone" className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Official Address</label>
                       <textarea defaultValue={settings?.contact_address || "Jl. KH Romli Tamim, Jombang"} id="contact_address" className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUpdateStudio({ 
                      contact_email: (document.getElementById('contact_email') as HTMLInputElement).value,
                      contact_phone: (document.getElementById('contact_phone') as HTMLInputElement).value,
                      contact_address: (document.getElementById('contact_address') as HTMLInputElement).value
                    })}
                    className="mt-8 w-full py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
                  >
                    Save Contact Info
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Legacy Settings View (Quick Toggles) */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl grid grid-cols-2 gap-8">
            {/* Kill Switch Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex flex-col items-center text-center">
               <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-all ${settings?.is_registration_open ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-rose-500/20 text-rose-500'}`}>
                  <Power size={40} />
               </div>
               <h3 className="text-xl font-black mb-2">Status Pendaftaran</h3>
               <p className="text-white/40 text-sm mb-8">Mengunci pendaftaran untuk publik secara instan.</p>
               <button 
                onClick={handleToggleRegistration}
                className={`px-10 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${settings?.is_registration_open ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'}`}
               >
                 {settings?.is_registration_open ? "TUTUP SEKARANG" : "BUKA SEKARANG"}
               </button>
            </div>

            {/* Live Announcement Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex flex-col">
               <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                  <Bell size={28} />
               </div>
               <h3 className="text-xl font-black mb-2">Live Announcement</h3>
               <p className="text-white/40 text-sm mb-6">Suntikkan pesan langsung ke dashboard semua peserta.</p>
               <textarea 
                defaultValue={settings?.live_announcement}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUpdateAnnouncement((e.target as HTMLTextAreaElement).value);
                  }
                }}
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-medium outline-none focus:border-cyan-500/50 transition-all mb-4"
                placeholder="Tulis pesan..."
               />
               <button className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10">
                  <Send size={14} /> Update Pesan
               </button>
            </div>
          </div>
        )}

        {/* Global Leaderboard View */}
        {activeTab === 'leaderboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <JuryLeaderboard />
          </motion.div>
        )}

        {/* Participant View */}
        {activeTab === 'participants' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="CARI DATA PESERTA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-12 py-4 text-sm font-bold placeholder:text-white/10 focus:border-cyan-500/50 outline-none transition-all"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
              <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                <Filter size={18} />
              </button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Nama / Email</th>
                      <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Kategori / Sekolah</th>
                      <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Status Bayar</th>
                      <th className="px-8 py-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {entries.filter(e => 
                      e.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      e.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(entry => (
                      <tr key={entry.id} className="hover:bg-white/[0.01] transition-all group">
                        <td className="px-8 py-6">
                          {editingId === entry.id ? (
                            <input 
                              className="bg-black/40 border border-cyan-500/30 rounded p-1 text-sm w-full"
                              value={editForm.fullName}
                              onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                            />
                          ) : (
                            <div>
                               <div className="font-black text-white">{entry.fullName}</div>
                               <div className="text-xs text-white/40 font-medium">{entry.email}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                           <div className="text-xs font-black text-cyan-400">{entry.category}</div>
                           <div className="text-xs text-white/40 font-bold">{entry.school}</div>
                        </td>
                        <td className="px-8 py-6">
                           <StatusBadge status={entry.payment_status} entry={entry} onUpdate={() => loadData()} />
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              {/* 🔍 View Proof (Inspector) */}
                              {entry.payment_status === "Paid" && (
                                <button 
                                  onClick={() => setViewProof(entry)}
                                  className="p-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20"
                                  title="Inspect Payment Proof"
                                >
                                  <Eye size={16} />
                                </button>
                              )}

                              {editingId === entry.id ? (
                                <>
                                  <button onClick={saveInlineEdit} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500/30">
                                    <Save size={16} />
                                  </button>
                                  <button onClick={() => setEditingId(null)} className="p-2 bg-white/5 text-white/40 rounded-lg">
                                    <CloseIcon size={16} />
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => handleInlineEdit(entry)} className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20">
                                  <Edit2 size={16} />
                                </button>
                              )}
                              
                              <button 
                                onClick={() => handleDelete(entry.id)}
                                className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS (Merged from Phase 8) --- */}
      <AnimatePresence>
        {/* Manual Entry Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-3xl p-10 shadow-2xl relative overflow-hidden"
            >
              {/* Decoration */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
              
              <h3 className="text-2xl font-black mb-8 relative z-10">Manual Registration</h3>
              <form onSubmit={handleAddSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Full Name</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none transition-all" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Email Address</label>
                    <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none transition-all" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Competition Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none transition-all" onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Olimpiade MIPA">Olimpiade MIPA</option>
                    <option value="Speech Contest">Speech Contest</option>
                    <option value="LKTI Nasional">LKTI Nasional</option>
                    <option value="MTQ Nasional">MTQ Nasional</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">Cancel</button>
                  <button className="flex-1 py-4 bg-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-cyan-900/20 active:scale-95 transition-all">Register Participant</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* View Payment Proof Modal */}
        {viewProof && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#020617] border border-white/10 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]"
            >
              {/* Left Side: The Image/Document */}
              <div className="flex-1 bg-white/[0.02] flex items-center justify-center p-10 border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
                {viewProof.payment_proof_url ? (
                  <img src={viewProof.payment_proof_url} alt="Proof" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10" />
                ) : (
                  <div className="text-center opacity-20">
                    <FileText size={80} className="mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Reference Document</p>
                  </div>
                )}
              </div>
              
              {/* Right Side: Meta & Actions */}
              <div className="w-full md:w-[400px] p-12 flex flex-col justify-between bg-black/40">
                <div className="space-y-10">
                  <div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">{viewProof.fullName}</h3>
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{viewProof.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-2">Category</p>
                      <p className="text-sm font-bold">{viewProof.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-2">Status</p>
                      <p className="text-sm font-bold text-amber-500">{viewProof.payment_status}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-3">Participant Note</p>
                    <p className="text-xs text-white/60 leading-relaxed font-medium italic">"{viewProof.notes || "No extra metadata provided."}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {viewProof.payment_status === "Paid" && (
                    <>
                      <button 
                        onClick={() => handleVerifyPayment(viewProof.id)}
                        disabled={isVerifying}
                        className="w-full py-5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {isVerifying ? <RefreshCcw size={14} className="animate-spin" /> : <Shield size={14} />} Approve Payment
                      </button>
                      <button 
                        onClick={() => handleRejectPayment(viewProof.id)}
                        className="w-full py-5 bg-white/5 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                      >
                        Reject Proof
                      </button>
                    </>
                  )}
                  <button onClick={() => setViewProof(null)} className="w-full py-5 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all">Close Inspector</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function TrophyIcon(props: any) {
  return <TrendingUp {...props} />;
}

function NavIcon({ icon: Icon, active, onClick }: { icon: any, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/30' : 'text-white/30 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={24} />
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colorMap: any = {
    cyan: "text-cyan-400 bg-cyan-400/5 border-cyan-400/10",
    emerald: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/5 border-amber-400/10",
    rose: "text-rose-400 bg-rose-400/5 border-rose-400/10"
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colorMap[color]}`}>
          <Icon size={20} />
       </div>
       <div className="text-sm font-black text-white/40 uppercase tracking-widest mb-1">{label}</div>
       <div className="text-2xl font-black">{value}</div>
    </div>
  );
}

function StatusBadge({ status, entry, onUpdate }: { status: string, entry: any, onUpdate: () => void }) {
  const getStyle = () => {
    switch(status) {
      case 'Verified': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'Paid': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-white/5 text-white/40 border-white/10";
    }
  };

  const handleVerify = async () => {
    if (status === 'Paid') {
       if (confirm(`Verifikasi pembayaran untuk ${entry.fullName}?`)) {
          const { success } = await adminUpdatePaymentStatusToSupabase(entry.id, 'Verified');
          if (success) onUpdate();
       }
    }
  };

  return (
    <button 
      onClick={handleVerify}
      className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${getStyle()} ${status === 'Paid' ? 'hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-amber-900/10' : 'cursor-default'}`}
    >
      {status || "None"}
    </button>
  );
}
