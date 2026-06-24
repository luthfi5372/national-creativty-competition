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
  RefreshCw,
  BookOpen,
  X,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trash2,
  Info
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
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Review Modal state
  const [showReview, setShowReview] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [reviewQuestions, setReviewQuestions] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [essayGrades, setEssayGrades] = useState<Record<string, number>>({});
  const [isSavingGrades, setIsSavingGrades] = useState(false);

  // Delete per-participant
  const [showDeleteParticipant, setShowDeleteParticipant] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLeaderboardData = async () => {
    const [attemptsRes, questionsRes] = await Promise.all([
      supabase.from('cbt_attempts').select('*').eq('exam_id', examId),
      supabase.from('cbt_questions').select('*').eq('exam_id', examId).order('created_at', { ascending: true })
    ]);

    if (attemptsRes.error) { console.error('Gagal:', attemptsRes.error); return; }
    if (attemptsRes.data) prosesDanUrutkanData(attemptsRes.data);
    if (questionsRes.data) setAllQuestions(questionsRes.data);
    setLoading(false);
  };

  const prosesDanUrutkanData = (dataRaw: any[]) => {
    const dataUrut = [...dataRaw].sort((a, b) => {
      const sA = a.score ?? 0;
      const sB = b.score ?? 0;
      if (sB !== sA) return sB - sA;
      if (a.violations_count !== b.violations_count) return a.violations_count - b.violations_count;
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });

    setAttempts(dataUrut);

    if (dataUrut.length > 0) {
      const skorList = dataUrut.map(p => p.score ?? 0);
      setTopScore(Math.max(...skorList));
      setAvgScore(Math.round(skorList.reduce((a, b) => a + b, 0) / skorList.length));
      setTotalCheatAlert(dataUrut.reduce((acc, curr) => acc + (curr.violations_count || 0), 0));
    }
  };

  // Buka modal review: ambil soal dari DB lalu tampilkan
  const openReview = async (attempt: any) => {
    setSelectedAttempt(attempt);
    setShowReview(true);
    setReviewLoading(true);
    setEssayGrades(attempt.answers?.essay_grades || {});

    const { data: qData } = await supabase
      .from('cbt_questions')
      .select('*')
      .eq('exam_id', examId);

    if (qData) setReviewQuestions(qData);
    setReviewLoading(false);
  };

  const handleSaveEssayGrades = async () => {
    if (!selectedAttempt) return;
    setIsSavingGrades(true);
    try {
      const updatedAnswers = {
        ...(selectedAttempt.answers || {}),
        essay_grades: essayGrades
      };

      const { error: updateError } = await supabase
        .from('cbt_attempts')
        .update({
          answers: updatedAnswers,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAttempt.id);

      if (updateError) throw updateError;

      const res = await fetch('/api/admin/llms/grading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt_id: selectedAttempt.id })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Gagal menghitung ulang skor.");
      }

      await fetchLeaderboardData();
      alert(`Berhasil melakukan approval! Skor peserta diperbarui menjadi: ${data.score} poin.`);
      setShowReview(false);
    } catch (err: any) {
      alert("Gagal menyimpan nilai: " + err.message);
    } finally {
      setIsSavingGrades(false);
    }
  };

  const handleDeleteParticipant = async () => {
    if (!deleteTargetUser) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('cbt_attempts')
        .delete()
        .eq('user_id', deleteTargetUser)
        .eq('exam_id', examId);
      if (error) throw error;
      
      setShowDeleteParticipant(false);
      setDeleteTargetUser(null);
      fetchLeaderboardData();
      alert("Data peserta berhasil dimusnahkan dari sesi ini!");
    } catch (err: any) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!examId) return;
    fetchLeaderboardData();

    // 📡 DENGAR SKOR REAL-TIME (Optimasi Bebas Lag & Tanpa Loop Query)
    const channel = supabase
      .channel(`live-cbt-scores-${examId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cbt_attempts' }, (payload) => {
        // Cek DELETE dulu sebelum cek payload.new (DELETE selalu punya payload.new = {})
        if (payload.eventType === 'DELETE' && payload.old) {
          setAttempts((prev) => {
            // Filter by primary key saja — hapus baris yang didelete
            const nextList = prev.filter(p => p.id !== payload.old.id);
            if (nextList.length > 0) {
              const skorList = nextList.map(p => p.score ?? 0);
              setTopScore(Math.max(...skorList));
              setAvgScore(Math.round(skorList.reduce((a, b) => a + b, 0) / skorList.length));
              setTotalCheatAlert(nextList.reduce((acc, curr) => acc + (curr.violations_count || 0), 0));
            } else {
              setTopScore(0);
              setAvgScore(0);
              setTotalCheatAlert(0);
            }
            return nextList;
          });
        } else if (payload.new && (payload.new as any).exam_id === examId) {
          setAttempts((prev) => {
            let nextList = [...prev];
            const updated = payload.new as any;

            const idx = nextList.findIndex(p => p.user_id === updated.user_id);
            if (idx !== -1) {
              nextList[idx] = updated;
            } else {
              nextList.push(updated);
            }

            // Urutkan ulang data (Score DESC, Violations ASC, updated_at ASC)
            nextList.sort((a, b) => {
              const sA = a.score ?? 0;
              const sB = b.score ?? 0;
              if (sB !== sA) return sB - sA;
              if (a.violations_count !== b.violations_count) return a.violations_count - b.violations_count;
              return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            });

            // Perbarui statistik secara lokal (tanpa kueri jaringan)
            if (nextList.length > 0) {
              const skorList = nextList.map(p => p.score ?? 0);
              setTopScore(Math.max(...skorList));
              setAvgScore(Math.round(skorList.reduce((a, b) => a + b, 0) / skorList.length));
              setTotalCheatAlert(nextList.reduce((acc, curr) => acc + (curr.violations_count || 0), 0));
            }

            return nextList;
          });
        }
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
    const headers = ['Peringkat', 'ID Peserta', 'Skor', 'Jumlah Pelanggaran', 'Terakhir Update'];
    // Gunakan rank asli dari attempts (bukan filtered index)
    const rows = filteredAttempts.map((item) => {
      const realRank = attempts.findIndex(a => a.id === item.id) + 1;
      return [realRank, item.user_id, item.score ?? 0,
        item.violations_count, new Date(item.updated_at).toLocaleTimeString()];
    });
    // \uFEFF = BOM karakter asli untuk Excel UTF-8
    const csvContent = "\uFEFF" + headers.join(',') + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Leaderboard_NCC13_${examId.split('-')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export detail: per question answer correctness
  const downloadDetailCSV = async () => {
    if (attempts.length === 0) return;
    setIsExporting(true);
    try {
      const questions = allQuestions.length > 0 ? allQuestions : [];
      if (questions.length === 0) {
        const { data } = await supabase.from('cbt_questions').select('*').eq('exam_id', examId).order('created_at', { ascending: true });
        if (data) questions.push(...data);
      }

      // Build header: basic info + per-question columns
      const questionHeaders = questions.map((q, i) => `"Soal ${i + 1} (${(q.options?.type || 'pg').toUpperCase()}) - Bobot ${q.weight || 0}"`);
      const answerHeaders = questions.map((q, i) => `"Jawaban Soal ${i + 1}"`);
      const statusHeaders = questions.map((q, i) => `"Status Soal ${i + 1}"`);

      const headers = [
        'Peringkat', 'ID Peserta', 'Skor Total', 'Jumlah Benar', 'Jumlah Salah', 'Jumlah Kosong',
        'Pelanggaran', 'Status Submit', 'Terakhir Update',
        ...questionHeaders,
        ...answerHeaders,
        ...statusHeaders
      ];

      const rows = filteredAttempts.map((item) => {
        // Gunakan rank asli dari full attempts list
        const realRank = attempts.findIndex(a => a.id === item.id) + 1;
        let benar = 0, salah = 0, kosong = 0;
        const qTexts: string[] = [];
        const answerCols: string[] = [];
        const statusCols: string[] = [];

        questions.forEach((q) => {
          const userAns = item.answers?.[q.id];
          const correctKey = q.correct_answer || q.answer || '';
          const qType = q.options?.type || 'pg';
          qTexts.push(`"${String(q.question_text || '').replace(/"/g, "'").substring(0, 80)}"`);

          if (!userAns) {
            kosong++;
            answerCols.push('(kosong)');
            statusCols.push('KOSONG');
          } else if (qType === 'essay') {
            const essayScore = item.answers?.essay_grades?.[q.id] ?? 0;
            answerCols.push(`"${String(userAns).replace(/"/g, "'").substring(0, 100)}"`);
            statusCols.push(`ESSAY (${essayScore} poin)`);
          } else if (qType === 'isian') {
            const correctAnswers = String(correctKey).toUpperCase().split('|').map((x: string) => x.trim());
            const isCorrect = correctAnswers.includes(String(userAns).trim().toUpperCase());
            if (isCorrect) benar++; else salah++;
            answerCols.push(`"${String(userAns).substring(0, 80)}"`);
            statusCols.push(isCorrect ? 'BENAR' : 'SALAH');
          } else {
            const isCorrect = String(userAns).trim().toUpperCase() === String(correctKey).trim().toUpperCase();
            if (isCorrect) benar++; else salah++;
            answerCols.push(String(userAns));
            statusCols.push(isCorrect ? 'BENAR' : 'SALAH');
          }
        });

        return [
          realRank,
          item.user_id,
          item.score ?? 0,
          benar, salah, kosong,
          item.violations_count || 0,
          item.submitted_at ? 'SELESAI' : 'BERLANGSUNG',
          new Date(item.updated_at).toLocaleString('id-ID'),
          ...qTexts,
          ...answerCols,
          ...statusCols
        ].join(',');
      });

      const csvContent = "\uFEFF" + headers.join(',') + "\n" + rows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Detail_Jawaban_NCC13_${examId.split('-')[0]}_${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Gagal mengekspor data: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  const rankMedal = (i: number) => {
    if (i === 0) return 'bg-amber-400 text-white shadow-lg shadow-amber-200';
    if (i === 1) return 'bg-slate-400 text-white shadow-md shadow-slate-200';
    if (i === 2) return 'bg-orange-400 text-white shadow-md shadow-orange-200';
    return 'bg-gray-100 text-gray-500';
  };

  // Hitung statistik untuk review
  const getReviewStats = () => {
    if (!selectedAttempt || reviewQuestions.length === 0) return { correct: 0, wrong: 0, empty: 0 };
    let correct = 0, wrong = 0, empty = 0;
    reviewQuestions.forEach(q => {
      const userAns = selectedAttempt.answers?.[q.id];
      const key = q.correct_answer || q.answer || '';
      const qType = q.options?.type || 'pg';
      if (!userAns) {
        empty++;
      } else if (qType === 'isian') {
        const correctAnswers = String(key).toUpperCase().split('|').map(x => x.trim());
        if (correctAnswers.includes(String(userAns).trim().toUpperCase())) {
          correct++;
        } else {
          wrong++;
        }
      } else if (qType === 'essay') {
        correct++; // Essay counted as answered / green in stats list
      } else {
        if (userAns.toUpperCase() === key.toUpperCase()) correct++;
        else wrong++;
      }
    });
    return { correct, wrong, empty };
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] font-sans text-gray-800">

      {/* ===== MODAL HAPUS PESERTA ===== */}
      {showDeleteParticipant && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Hapus Data Peserta?</h2>
            <p className="text-sm text-gray-500 font-medium mt-2">ID: <span className="font-black text-gray-800">{deleteTargetUser}</span></p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Semua data (jawaban, skor, submit) peserta ini akan <span className="font-black text-rose-600">dihapus permanen</span>.
              Peserta akan bisa ikut ujian kembali setelah ini.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDeleteParticipant(false); setDeleteTargetUser(null); }} disabled={isDeleting} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">Batal</button>
              <button onClick={handleDeleteParticipant} disabled={isDeleting} className="flex-1 py-3.5 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 flex items-center justify-center gap-2">
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL REVIEW MOODLE-STYLE ===== */}
      {showReview && selectedAttempt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="bg-[#f4f7fe] rounded-[32px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-white px-8 py-5 flex justify-between items-center border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#5145cd]" /> Detail Jawaban Peserta
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  ID: {selectedAttempt.user_id} · Skor: {selectedAttempt.score ?? 0} poin
                </p>
              </div>
              <button onClick={() => setShowReview(false)} className="w-10 h-10 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-gray-500 rounded-full flex items-center justify-center transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Statistik ringkas */}
            {!reviewLoading && (
              <div className="grid grid-cols-3 gap-3 px-8 py-4 bg-white border-b border-gray-50 flex-shrink-0">
                {[
                  { label: 'Benar', value: getReviewStats().correct, color: 'emerald', icon: CheckCircle2 },
                  { label: 'Salah', value: getReviewStats().wrong, color: 'rose', icon: XCircle },
                  { label: 'Kosong', value: getReviewStats().empty, color: 'gray', icon: MinusCircle },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${
                    s.color === 'emerald' ? 'bg-emerald-50 border-emerald-100' :
                    s.color === 'rose' ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <s.icon className={`w-5 h-5 flex-shrink-0 ${
                      s.color === 'emerald' ? 'text-emerald-500' :
                      s.color === 'rose' ? 'text-rose-500' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className={`text-2xl font-black leading-none ${
                        s.color === 'emerald' ? 'text-emerald-600' :
                        s.color === 'rose' ? 'text-rose-600' : 'text-gray-500'
                      }`}>{s.value}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Konten soal */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {reviewLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#5145cd] mb-3" />
                  <p className="text-sm font-bold text-gray-400">Memuat soal...</p>
                </div>
              ) : reviewQuestions.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-sm font-bold">Soal tidak ditemukan.</p>
                </div>
              ) : (
                reviewQuestions.map((q, idx) => {
                  const userAnswer = selectedAttempt.answers?.[q.id];
                  const correctKey = q.correct_answer || q.answer || '';
                  const qType = q.options?.type || 'pg';
                  const isEmpty = !userAnswer;

                  let isCorrect = false;
                  if (qType === 'isian') {
                    const correctAnswers = String(correctKey).toUpperCase().split('|').map(x => x.trim());
                    isCorrect = !!userAnswer && correctAnswers.includes(String(userAnswer).trim().toUpperCase());
                  } else if (qType === 'essay') {
                    isCorrect = false; // Neutral
                  } else {
                    isCorrect = !!userAnswer && String(userAnswer).trim().toUpperCase() === String(correctKey).trim().toUpperCase();
                  }

                  const borderColor = isEmpty 
                    ? 'border-gray-200' 
                    : qType === 'essay' 
                      ? 'border-amber-200' 
                      : isCorrect 
                        ? 'border-emerald-300' 
                        : 'border-rose-300';

                  const bgColor = isEmpty 
                    ? 'bg-white' 
                    : qType === 'essay' 
                      ? 'bg-amber-50/10' 
                      : isCorrect 
                        ? 'bg-emerald-50/30' 
                        : 'bg-rose-50/30';

                  return (
                    <div key={q.id} className={`rounded-[20px] border-2 p-5 ${borderColor} ${bgColor} bg-white`}>
                      {/* Soal header */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soal No. {idx + 1}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-indigo-100">
                            {qType === 'pg' ? 'Pilihan Ganda' : qType === 'isian' ? 'Isian Singkat' : 'Essai Bebas'}
                          </span>
                        </div>
                        {isEmpty ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-full">
                            <MinusCircle className="w-3 h-3" /> TIDAK DIJAWAB
                          </span>
                        ) : qType === 'essay' ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full">
                            <Info className="w-3 h-3" /> ESSAI
                          </span>
                        ) : isCorrect ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> BENAR
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full">
                            <XCircle className="w-3 h-3" /> SALAH
                          </span>
                        )}
                      </div>

                      {/* Teks soal */}
                      <p className="text-sm font-medium text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">
                        {q.question_text}
                      </p>

                      {/* Perbandingan jawaban */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                        <div className={`p-4 rounded-2xl border ${
                          isEmpty ? 'bg-gray-50 border-gray-200' :
                          qType === 'essay' ? 'bg-amber-50/30 border-amber-200' :
                          isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                        }`}>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Jawaban Peserta</p>
                          {isEmpty ? (
                            <p className="text-sm font-bold text-gray-400 italic">— Tidak menjawab —</p>
                          ) : qType === 'pg' ? (
                            <p className={`text-base font-black ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {(() => {
                                const letters = userAnswer.split('');
                                return letters.map((l: string) => {
                                  const text = q.options?.[l] || q.options?.[l.toLowerCase()] || '';
                                  return `${l}${text ? `: ${text}` : ''}`;
                                }).join(', ');
                              })()}
                            </p>
                          ) : (
                            <p className={`text-sm font-bold whitespace-pre-wrap leading-relaxed ${qType === 'essay' ? 'text-amber-900' : isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {userAnswer}
                            </p>
                          )}
                        </div>

                        <div className="p-4 rounded-2xl border bg-indigo-50 border-indigo-200">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Kunci / Panduan Jawaban</p>
                          {qType === 'pg' ? (
                            <p className="text-base font-black text-indigo-700">
                              {(() => {
                                const letters = correctKey.split('');
                                return letters.map((l: string) => {
                                  const text = q.options?.[l] || q.options?.[l.toLowerCase()] || '';
                                  return `${l}${text ? `: ${text}` : ''}`;
                                }).join(', ');
                              })()}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-indigo-700 whitespace-pre-wrap leading-relaxed">
                              {correctKey}
                            </p>
                          )}
                        </div>
                      </div>

                      {qType === 'essay' && !isEmpty && (
                        <div className="mt-4 p-4 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 text-left">
                          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                            ⭐️ PENILAIAN JURI & APPROVAL
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-500 font-bold">
                                Berikan poin untuk jawaban ini
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                📌 Referensi bobot soal: <span className="font-black text-indigo-600">{q.weight || 0}</span> poin · Admin bebas menentukan nilai
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={essayGrades[q.id] !== undefined ? essayGrades[q.id] : ""}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value) || 0);
                                  setEssayGrades(prev => ({ ...prev, [q.id]: val }));
                                }}
                                className="w-28 px-3 py-2 bg-white border-2 border-amber-300 rounded-xl font-black text-center text-[#5145cd] focus:border-[#5145cd] focus:ring-2 focus:ring-[#5145cd]/20 text-sm shadow-sm transition-all"
                                placeholder="0"
                              />
                              <span className="text-xs font-bold text-gray-400">Poin</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal */}
            <div className="bg-white px-8 py-4 border-t border-gray-100 flex justify-between items-center gap-4 flex-shrink-0">
              <span className="text-xs font-bold text-gray-400">
                * Pemberian poin essay membutuhkan klik tombol Simpan & Akumulasi Skor di sebelah kanan.
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReview(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Tutup
                </button>
                <button
                  onClick={handleSaveEssayGrades}
                  disabled={isSavingGrades}
                  className="px-6 py-2.5 bg-[#5145cd] hover:bg-[#3d32a8] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isSavingGrades ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : '💾 Simpan & Akumulasi Skor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <Download className="w-4 h-4 mr-2 text-indigo-500" /> Rekap Skor
            </button>
            <button
              onClick={downloadDetailCSV}
              disabled={isExporting}
              className="flex items-center px-4 py-2.5 bg-[#5145cd] hover:bg-[#3d32a8] border border-transparent text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-60"
            >
              {isExporting
                ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                : <Download className="w-4 h-4 mr-2" />
              }
              {isExporting ? 'Mengekspor...' : 'Detail Jawaban'}
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
                <p className={`text-4xl font-black mt-1 ${(s as any).alert && s.value > 0 ? 'text-rose-600' : 'text-gray-900'}`}>{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                s.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                s.color === 'indigo' ? 'bg-indigo-50 text-[#5145cd]' :
                (s as any).alert && s.value > 0 ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' : 'bg-rose-50 text-rose-400'
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
                    <th className="py-4 px-6 text-right">Update</th>
                    <th className="py-4 px-6 text-center">Review</th>
                    <th className="py-4 px-6 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAttempts.map((item, index) => {
                    const score = item.score ?? 0;
                    const hasViolations = item.violations_count > 0;
                    const isDone = !!item.submitted_at;
                    const hasAnswers = item.answers && Object.keys(item.answers).length > 0;

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

                        {/* TOMBOL REVIEW */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openReview(item)}
                            disabled={!hasAnswers && !isDone}
                            className={`flex items-center gap-1.5 mx-auto px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              hasAnswers || isDone
                                ? 'bg-[#5145cd] text-white hover:bg-[#3d32a8] shadow-md shadow-indigo-100 hover:-translate-y-0.5'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5" /> Review
                          </button>
                        </td>

                        {/* TOMBOL HAPUS PESERTA */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => { setDeleteTargetUser(item.user_id); setShowDeleteParticipant(true); }}
                            title="Hapus data peserta ini"
                            className="flex items-center gap-1.5 mx-auto px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Reset
                          </button>
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
