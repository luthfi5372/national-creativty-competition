"use client";
import { Search, Users, CheckCircle2, X, Pencil, Key, Trash2 } from "lucide-react";

interface UserRegistryTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  isLoading: boolean;
  filteredParticipants: any[];
  activeTab: string;
  updatePaymentStatus: (id: string, status: string) => void;
  setSelectedTicket: (participant: any) => void;
  setEditingParticipant: (participant: any) => void;
  resetPassword: (email: string) => void;
  deleteEntry: (id: string, name: string) => void;
  isSaving: boolean;
}

export default function UserRegistryTab({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  isLoading,
  filteredParticipants,
  activeTab,
  updatePaymentStatus,
  setSelectedTicket,
  setEditingParticipant,
  resetPassword,
  deleteEntry,
  isSaving
}: UserRegistryTabProps) {
  return (
    <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-3xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800">
            🗄️ Master Registry Pengguna
          </h3>
          <p className="text-sm text-slate-500">
            Manajemen seluruh akun terdaftar di sistem NCC 13th.
          </p>
        </div>
        
        {/* Management HUD: Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari email atau nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-bold"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Olimpiade MIPA">Olimpiade MIPA</option>
            <option value="Speech Contest">Speech Contest</option>
            <option value="LKTI Nasional">LKTI Nasional</option>
            <option value="MTQ Nasional">MTQ Nasional</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase tracking-widest font-black">
              <th className="pb-4">Profil Peserta</th>
              <th className="pb-4">Kontak & Kategori</th>
              <th className="pb-4">Status Pembayaran</th>
              <th className="pb-4 text-right">Otoritas Admin</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-400 animate-pulse font-bold uppercase tracking-tighter">Scanning database...</td></tr>
            ) : filteredParticipants.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-black italic">Radar bersih. Tidak ada data yang sesuai.</td></tr>
            ) : (
              filteredParticipants.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-indigo-200">
                        {p.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-xs tracking-wide">{p.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">UID: {String(p.id).slice(0, 8).toUpperCase()}-...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <p className="text-xs font-bold tracking-tight text-slate-600">{p.email}</p>
                    <p className="text-[10px] text-slate-400">{p.category} - {p.school}</p>
                  </td>
                  <td className="py-5">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                      p.payment_status === 'Verified' ? 'bg-green-50 text-green-600 border-green-100' :
                      p.payment_status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {p.payment_status === 'Verified' ? 'TERVERIFIKASI' : p.payment_status === 'Pending' ? 'MENUNGGU REVIEW' : 'BELUM BAYAR'}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingParticipant(p)}
                          className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all"
                          title="Edit Data"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedTicket(p)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black hover:bg-blue-600 hover:text-white shadow-sm transition-all"
                          title="Lihat Tiket"
                        >
                          🎫 TIKET
                        </button>
                      <button 
                        onClick={() => resetPassword(p.email)}
                        className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-600 hover:text-white rounded-xl transition-all"
                        title="Reset Password"
                      >
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => deleteEntry(p.id, p.full_name)}
                        disabled={isSaving}
                        className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Hapus Peserta"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
