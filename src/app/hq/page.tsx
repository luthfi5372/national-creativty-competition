"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HQDashboardLight() {
  const router = useRouter();
  
  // State bayangan (Nanti kita sambungkan ke Supabase)
  const [broadcastText, setBroadcastText] = useState("Pendaftaran Gelombang 1 Resmi Dibuka!");
  const [isRegOpen, setIsRegOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans p-4 md:p-8 relative overflow-hidden">
      
      {/* Ornamen Latar Belakang (Cahaya Halus) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 rounded-3xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">System Online</p>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NCC COMMAND CENTER
            </h1>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm">
              📥 Export CSV
            </button>
            <button 
              onClick={() => {
                document.cookie = "ncc_bypass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                router.push('/login');
              }}
              className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold shadow-sm hover:bg-red-100 transition-all text-sm"
            >
              Keluar Sistem
            </button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Pendaftar", value: "1,248", color: "text-blue-600", icon: "👥" },
            { title: "Terverifikasi", value: "892", color: "text-green-600", icon: "✅" },
            { title: "Menunggu Review", value: "356", color: "text-amber-500", icon: "⏳" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-3xl flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</h3>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}

          {/* Master Switch Panel */}
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg p-6 rounded-3xl flex flex-col justify-between text-white">
            <h3 className="text-sm font-bold text-indigo-100 uppercase tracking-wider mb-4">Status Pendaftaran</h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black">{isRegOpen ? "OPEN" : "CLOSED"}</span>
              <button 
                onClick={() => setIsRegOpen(!isRegOpen)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isRegOpen ? 'bg-green-400' : 'bg-slate-400/50'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isRegOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* ACTION PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TERMINAL SIARAN (Broadcast Center) */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">📢 Terminal Siaran</h3>
            <p className="text-sm text-slate-500 mb-6">Teks ini akan muncul di dashboard semua peserta.</p>
            
            <textarea 
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 mb-4"
              placeholder="Ketik pengumuman di sini..."
            ></textarea>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md">
              Kirim Siaran Global
            </button>
          </div>

          {/* TABEL VERIFIKASI CEPAT */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 rounded-3xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">⚡ Antrean Verifikasi Pembayaran</h3>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">Lihat Semua Data -></button>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Nama Peserta</th>
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold">Bukti TF</th>
                    <th className="pb-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {/* Contoh Data Dummy */}
                  {[1, 2, 3].map((item) => (
                    <tr key={item} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-medium">Budi Santoso</td>
                      <td className="py-4"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold">LKTI</span></td>
                      <td className="py-4"><button className="text-blue-500 hover:underline">Lihat Gambar</button></td>
                      <td className="py-4 text-right flex justify-end gap-2">
                        <button className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors" title="Terima">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                        <button className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors" title="Tolak">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
