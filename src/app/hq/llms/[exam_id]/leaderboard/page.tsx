'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  ShieldAlert,
  Search,
  Download,
  Clock,
  RefreshCw
} from 'lucide-react';

export default function LiveLeaderboard() {
  const supabase = createClient();
  const params = useParams();
  const examId = params.exam_id as string;

  const [attempts, setAttempts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [topScore, setTopScore] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [totalCheatAlert, setTotalCheatAlert] = useState(0);

  const fetchLeaderboardData = async () => {
    const { data, error } = await supabase
      .from('cbt_attempts')
      .select('*');

    if (error) { console.error('Gagal:', error); return; }
    if (data) prosesDanUrutkanData(data);
    setLoading(false);
  };

  const prosesDanUrutkanData = (dataRaw: any[]) => {
    const dataUrut = [...dataRaw].sort((a, b) => {
      const sA = a.current_score ?? 0;
      const sB = b.current_score ?? 0;
      if (sB !== sA) return sB - sA;
      if (a.violations_count !== b.violations_count) return a.violations_count - b.violations_count;
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });

    setAttempts(dataUrut);

    if (dataUrut.length > 0) {
      const skorList = dataUrut.map(p => p.current_score ?? 0);
      setTopScore(Math.max(...skorList));
      setAvgScore(Math.round(skorList.reduce((a, b) => a + b, 0) / skorList.length));
      setTotalCheatAlert(dataUrut.reduce((acc, curr) => acc + (curr.violations_count || 0), 0));
    }
  };

  useEffect(() => {
    if (!examId) return;
    fetchLeaderboardData();

    const channel = supabase
      .channel(`live-cbt-scores-${examId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cbt_attempts' }, () => {
        fetchLeaderboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [examId]);

  const filteredAttempts = attempts.filter((item) => {
    const uid = item.user_id ? String(item.user_id).toLowerCase() : '';
    return uid.includes(searchQuery.toLowerCase());
  });

  const downloadCSV = () => {
    if (attempts.length === 0) return;
    const headers = ['Peringkat', 'ID Peserta', 'Skor', 'Jumlah Pelanggaran', 'Terakhir Update\n'];
    const rows = filteredAttempts.map((item, index) => [
      index + 1, item.user_id, item.current_score ?? 0,
      item.violations_count, new Date(item.updated_at).toLocaleTimeString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Leaderboard_NCC13_${examId.split('-')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const rankMedal = (i: number) => {
    if (i === 0) return 'bg-amber-400 text-white shadow-lg shadow-amber-200';
    if (i === 1) return 'bg-slate-400 text-white shadow-md shadow-slate-200';
    if (i === 2) return 'bg-orange-400 text-white shadow-md shadow-orange-200';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans text-gray-800">

      {/* STICKY TOP BAR */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/hq/llms" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-[#5145cd] transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Live Scoring & Peringkat
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">NCC 13th · Auto-update real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeaderboardData} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-[#5145cd] transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={downloadCSV} className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 shadow-sm transition-all">
              <Download className="w-4 h-4 mr-2 text-indigo-500" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">

        {/* STATS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: 'Skor Tertinggi', value: topScore, icon: Trophy, color: 'amber' },
            { label: 'Rata-Rata Skor', value: avgScore, icon: Users, color: 'indigo' },
            { label: 'Total Pelanggaran', value: totalCheatAlert, icon: ShieldAlert, color: 'rose', alert: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-4xl font-black mt-1 ${s.alert && s.value > 0 ? 'text-rose-600' : 'text-gray-900'}`}>{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                s.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                s.color === 'indigo' ? 'bg-indigo-50 text-[#5145cd]' :
                s.alert && s.value > 0 ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' : 'bg-rose-50 text-rose-400'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-10" />
            <input
              type="text"
              placeholder="Cari berdasarkan ID Peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm text-gray-700 focus:ring-2 focus:ring-[#5145cd]/20 focus:border-[#5145cd] transition-all shadow-sm"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                <p className="text-sm text-gray-400">Menghubungkan ke saluran real-time...</p>
              </div>
            ) : filteredAttempts.length === 0 ? (
              <div className="p-20 text-center text-sm text-gray-400">
                Belum ada peserta yang submit.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="py-4 px-6 text-center w-20">Rank</th>
                    <th className="py-4 px-6">ID Peserta</th>
                    <th className="py-4 px-6 text-center">Skor</th>
                    <th className="py-4 px-6 text-center">Pelanggaran</th>
                    <th className="py-4 px-6 text-right">Update Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAttempts.map((item, index) => {
                    const score = item.current_score ?? 0;
                    const hasViolations = item.violations_count > 0;
                    const isDone = !!item.submitted_at;

                    return (
                      <tr key={item.id || item.user_id}
                        className={`hover:bg-gray-50/50 transition-colors ${hasViolations ? 'bg-rose-50/20' : ''}`}
                      >
                        {/* RANK */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${rankMedal(index)}`}>
                            {index + 1}
                          </span>
                        </td>

                        {/* ID */}
                        <td className="py-4 px-6 font-semibold text-gray-800">
                          {item.user_id}
                          {isDone && (
                            <span className="ml-2 bg-emerald-100 text-emerald-700 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">Selesai</span>
                          )}
                        </td>

                        {/* SKOR */}
                        <td className="py-4 px-6 text-center">
                          <span className={`text-2xl font-black ${score > 0 ? 'text-[#5145cd]' : 'text-gray-300'}`}>
                            {score}
                          </span>
                        </td>

                        {/* PELANGGARAN */}
                        <td className="py-4 px-6 text-center">
                          {hasViolations ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-600 border border-rose-100">
                              ⚠️ {item.violations_count}×
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              ✓ Aman
                            </span>
                          )}
                        </td>

                        {/* WAKTU */}
                        <td className="py-4 px-6 text-right text-gray-400 font-mono text-xs">
                          <span className="inline-flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
