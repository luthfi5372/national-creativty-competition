"use client";
import { Loader2 } from "lucide-react";

interface ScoringTabProps {
  participants: any[];
  categoryFilter: string;
  isScoring: boolean;
  handleSubmitScore: (id: string, score: number) => void;
}

export default function ScoringTab({
  participants,
  categoryFilter,
  isScoring,
  handleSubmitScore
}: ScoringTabProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">⚖️ Panel Penilaian & Leaderboard</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Scoring NCC ke-13</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase tracking-[0.2em] font-black">
                <th className="pb-6">Peringkat & Peserta</th>
                <th className="pb-6">Kategori</th>
                <th className="pb-6 text-center">Skor Akhir (0-100)</th>
                <th className="pb-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {participants
                .filter(p => categoryFilter === "ALL" || p.category === categoryFilter)
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((row, index) => (
                <tr key={row.id} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-all">
                  <td className="py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-sm ${
                        index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" : 
                        index === 1 ? "bg-slate-100 text-slate-500 border border-slate-200" : 
                        index === 2 ? "bg-orange-50 text-orange-600 border border-orange-100" : 
                        "bg-slate-50 text-slate-400"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-base">{row.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.school}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase">{row.category}</span>
                  </td>
                  <td className="py-6">
                    <div className="flex justify-center">
                      <input 
                        type="number" 
                        defaultValue={row.score || ""}
                        id={`score-input-${row.id}`}
                        className="w-24 px-4 py-3 text-center bg-slate-100 border-none rounded-2xl font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <button 
                      disabled={isScoring}
                      onClick={() => {
                        const inputElement = document.getElementById(`score-input-${row.id}`) as HTMLInputElement;
                        if (inputElement) handleSubmitScore(row.id, Number(inputElement.value));
                      }}
                      className="px-6 py-3 bg-emerald-600 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:shadow-none transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isScoring ? <Loader2 className="animate-spin" size={16} /> : "Kunci Nilai"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
