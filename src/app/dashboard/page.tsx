"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { Bell, Megaphone, User, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // --- MESIN PENARIK PENGUMUMAN DARI MARKAS BESAR ---
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Tarik data dari tabel announcements, urutkan dari yang paling baru
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error("Gagal menarik pengumuman:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();

    // Radar Real-time: Pantau pengumuman baru
    const channel = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        setAnnouncements(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-12 relative overflow-hidden">
      {/* Ornamen Background Liquid Glass */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* HEADER WELCOME */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Halo, Peserta NCC! 👋</h1>
            <p className="text-slate-500 font-medium mt-1">Selamat datang di Dasbor Resmi National Creativity Competition 13th.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl border border-white/80 px-4 py-2 rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              P
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Anda</p>
              <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                <Clock size={14} className="text-amber-500"/> Menunggu Verifikasi
              </p>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: STATUS & AKSI (Makan 1 Kolom) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-blue-500" />
                Langkah Selanjutnya
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-sm">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="font-medium text-green-800">Lengkapi Profil Biodata</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-amber-500" />
                  <span className="font-medium text-amber-800">Unggah Bukti Transfer</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-200 text-sm active:scale-[0.98]">
                Lengkapi Berkas Sekarang
              </button>
            </div>
          </motion.div>

          {/* KOLOM KANAN: PAPAN PENGUMUMAN DARI MARKAS BESAR (Makan 2 Kolom) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 min-h-[400px]">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Megaphone size={22} className="text-blue-600" />
                  Papan Pengumuman Resmi
                </h2>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <Bell size={12} /> Live
                </span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-400 font-medium text-sm">Menyinkronkan sinyal dengan Markas Besar...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-12">
                  <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
                  <h3 className="text-slate-500 font-bold">Belum Ada Pengumuman</h3>
                  <p className="text-slate-400 text-sm mt-1">Panitia belum menyiarkan informasi apapun saat ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => {
                    const date = new Date(announcement.created_at);
                    const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={announcement.id} className="bg-white/80 border border-slate-100 p-5 rounded-2xl hover:shadow-md transition-shadow animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 text-lg">{announcement.title}</h3>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md whitespace-nowrap">
                            {formattedDate} • {formattedTime} WIB
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
