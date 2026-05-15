"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ShieldCheck, Lock, ChevronRight, 
  AlertTriangle, Loader2, GraduationCap,
  Sparkles, Ticket
} from 'lucide-react';

export default function GerbangUjianPeserta() {
  const [token, setToken] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  const handleValidasiToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !ticketId.trim()) {
      setErrorMsg("Harap masukkan Ticket ID dan Token Ujian.");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Cari jadwal di database berdasarkan Token
      const { data: jadwal, error: fetchError } = await supabase
        .from('cbt_exams')
        .select('*')
        .eq('token', token.toUpperCase().trim())
        .single();

      if (fetchError || !jadwal) {
        throw new Error("Token tidak valid. Silakan periksa kembali ketikan Anda.");
      }

      // 2. CEK STATUS AKTIF: Cegah peserta masuk jika Admin belum menyalakan "Toggle"
      if (!jadwal.is_active) {
        throw new Error("Sesi ujian ini sedang ditutup atau belum dimulai oleh panitia.");
      }

      // 3. Start or Resume Attempt
      const res = await fetch("/api/cbt/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: ticketId.trim(), 
          exam_id: jadwal.id, 
          token: token.toUpperCase().trim() 
        }),
      });
      
      const attemptRes = await res.json();
      
      if (!attemptRes.success) {
        throw new Error(attemptRes.error || "Gagal memverifikasi identitas Anda.");
      }

      const attempt = attemptRes.data;

      if (attempt.status === 'submitted') {
        throw new Error("Sesi ujian Anda untuk tiket ini sudah dikumpulkan.");
      }

      // 4. Save to Session Storage for the dynamic page to pick up
      sessionStorage.setItem('ncc_ticket_id', ticketId.trim());
      sessionStorage.setItem('ncc_attempt_id', attempt.id);

      // 5. Redirect to Actual Exam Page
      router.push(`/ujian/${jadwal.id}`);

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-inter relative overflow-hidden">
      {/* 🌌 COSMIC BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
             <ShieldCheck size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gerbang Ujian NCC</h2>
          <p className="text-slate-400 text-sm mt-3 font-medium">
            National Creativity Competition ke-13 <br/>
            <span className="text-indigo-400">Silakan verifikasi tiket & token sesi Anda.</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
          <form onSubmit={handleValidasiToken} className="space-y-8">
            <div className="space-y-6">
              {/* INPUT TICKET ID */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                   <Ticket size={14} /> Ticket ID Peserta
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="NCC-XXXX"
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700"
                  required
                />
              </div>

              {/* INPUT TOKEN */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                   <Lock size={14} /> Token Sesi Ujian
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="TOKEN-ANDA"
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black tracking-[0.2em] text-indigo-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all uppercase placeholder:text-slate-700"
                  maxLength={12}
                  required
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-200 font-bold leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black text-sm shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Ruang Ujian <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={12} /> Secure Gateway
           </div>
           <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <Sparkles size={12} /> MIPA Engine v2
           </div>
        </div>
      </div>
    </div>
  );
}
