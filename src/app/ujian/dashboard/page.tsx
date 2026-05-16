'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  GraduationCap, 
  ClipboardCheck,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- 🛡️ GATEKEEPER SINKRONISASI ---
  useEffect(() => {
    const savedUser = localStorage.getItem('ncc_user');
    if (!savedUser) {
      // Tendang balik jika mencoba bypass URL
      router.push('/ujian/login');
    } else {
      setStudent(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('ncc_user');
    router.push('/ujian/login');
  };

  const handleStartExam = () => {
    // Redirect ke ID sesi ujian aktif
    router.push('/ujian/NCC13-MIPA-001');
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center text-indigo-600 shadow-inner">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Sinkronisasi Pusat Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 font-sans select-none overflow-x-hidden">
      
      {/* 🧬 INJEKSI ANIMASI CUSTOM */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes softUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up-1 { animation: softUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .animate-fade-up-2 { animation: softUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .animate-fade-up-3 { animation: softUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
      `}} />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 🧼 NAVIGATION BAR */}
        <div className="animate-fade-up-1 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 px-3 text-left">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100">
              N
            </div>
            <div className="text-left">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">CBT Dashboard</span>
               <span className="text-xs font-bold text-indigo-600">Peserta Cabang MIPA</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2.5 border border-gray-100 hover:border-rose-100 hover:bg-rose-50 active:scale-95 text-gray-400 hover:text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Keluar Sesi
          </button>
        </div>

        {/* 🏛️ MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* 👤 PROFILE CARD */}
          <div className="animate-fade-up-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 shadow-inner mb-6 transition-transform duration-500 group-hover:scale-110">
              <User className="w-10 h-10" />
            </div>

            <div className="text-center">
               <h2 className="text-lg font-black text-gray-800 leading-tight">{student.full_name}</h2>
               <p className="text-[10px] font-mono font-bold text-indigo-400 mt-2 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100 inline-block">{student.username}</p>
            </div>

            <div className="w-full border-t border-gray-50 mt-8 pt-8 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Kategori</span>
                <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl text-[9px] tracking-widest uppercase">{student.branch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Status Data</span>
                <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl text-[9px] flex items-center tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* 📋 EXAM & RULES SECTION */}
          <div className="animate-fade-up-2 md:col-span-2 space-y-6 text-left">
            
            {/* ACTIVE EXAM CARD */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl group relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <GraduationCap className="w-32 h-32 text-indigo-900" />
              </div>

              <div className="flex items-start justify-between relative z-10 text-left">
                <div className="text-left">
                  <span className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-xl text-[9px] font-black text-amber-600 uppercase tracking-widest">Sesi Tersedia</span>
                  <h3 className="text-2xl font-black text-gray-800 mt-4 tracking-tight leading-tight">Penyisihan: Matematika & Logika</h3>
                  <div className="flex flex-wrap gap-4 mt-3">
                     <p className="text-[10px] text-gray-400 font-bold flex items-center">
                       <Clock className="w-3.5 h-3.5 mr-2 text-indigo-300" /> 90 Menit
                     </p>
                     <p className="text-[10px] text-gray-400 font-bold flex items-center">
                       <ClipboardCheck className="w-3.5 h-3.5 mr-2 text-indigo-300" /> 50 Butir Soal
                     </p>
                  </div>
                </div>
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
              </div>

              <button
                onClick={handleStartExam}
                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all duration-300 shadow-2xl shadow-indigo-200/50 flex items-center justify-center gap-3 group relative z-10"
              >
                <span>Masuk Ruang Ujian</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* PROTOCOLS CARD */}
            <div className="animate-fade-up-3 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-left">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center mb-6">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Protokol Integritas CBT
              </h4>
              <ul className="space-y-5 text-left">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                     <span className="font-black text-xs">1</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed text-left">
                    <strong className="text-gray-700">Sistem Anti-Tab:</strong> Keluar dari layar ujian atau berpindah tab akan tercatat secara otomatis oleh Pusat Komando sebagai upaya diskualifikasi.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                     <span className="font-black text-xs">2</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed text-left">
                    <strong className="text-gray-700">Auto-Cloud Sync:</strong> Jawaban Anda disinkronkan setiap 1 detik. Anda dapat melanjutkan ujian di perangkat lain jika terjadi kendala teknis.
                  </p>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
