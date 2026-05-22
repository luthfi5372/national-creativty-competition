'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { generateTicketCode } from '@/lib/utils';
import { 
  UserIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Lazy-load react-confetti agar tidak crash di SSR
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function StudentDashboard() {
  const router = useRouter();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [student, setStudent] = useState<any>(null);
  const [examDetail, setExamDetail] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // ── STATUS KELULUSAN ─────────────────────────────────────────
  const [statusPassing, setStatusPassing] = useState<'PENDING' | 'PASSED' | 'FAILED'>('PENDING');
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    // Tangkap ukuran layar untuk Confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const onResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);

    const savedUser = localStorage.getItem('ncc_user');
    if (!savedUser) { router.push('/ujian/login'); return; }
    
    const parsedUser = JSON.parse(savedUser);
    setStudent(parsedUser);

    // Notifikasi sukses dari URL param
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('status') === 'success') {
      showToast("Luar biasa! Ujian berhasil diselesaikan dan skor telah diamankan.", "success");
      window.history.replaceState(null, '', '/ujian/dashboard');
    }

    const fetchAll = async () => {
      if (parsedUser.active_exam_id) {
        // 1. Detail waktu ujian
        const { data: exData } = await supabase
          .from('cbt_exams')
          .select('duration')
          .eq('id', parsedUser.active_exam_id)
          .single();
        if (exData) setExamDetail(exData);

        // 2. Hitung soal tersedia
        const { count } = await supabase
          .from('cbt_questions')
          .select('*', { count: 'exact', head: true })
          .eq('exam_id', parsedUser.active_exam_id);
        setQuestionCount(count || 0);

        // 3. Cek attempt peserta (berdasarkan ID Tiket, bukan NISN)
        const userId = parsedUser.id
          ? `NCC-${generateTicketCode(parsedUser.id)}`
          : (parsedUser.nisn || parsedUser.username);

        const { data: existingAttempt } = await supabase
          .from('cbt_attempts')
          .select('id, submitted_at, status_passing')
          .eq('user_id', userId)
          .eq('exam_id', parsedUser.active_exam_id)
          .maybeSingle();

        if (existingAttempt) {
          await supabase.from('cbt_attempts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', existingAttempt.id);

          if (existingAttempt.submitted_at) {
            setIsDone(true);
            localStorage.setItem(`cbt_submitted_${parsedUser.active_exam_id}`, 'true');
          } else {
            setIsDone(false);
            localStorage.removeItem(`cbt_submitted_${parsedUser.active_exam_id}`);
          }

          // ── CEK STATUS KELULUSAN ──────────────────────────────
          const sp = existingAttempt.status_passing as 'PENDING' | 'PASSED' | 'FAILED' | null;
          if (sp === 'PASSED') {
            setStatusPassing('PASSED');
            setShowCelebration(true);
          } else if (sp === 'FAILED') {
            setStatusPassing('FAILED');
          } else {
            setStatusPassing('PENDING');
          }

        } else {
          // Kertas baru untuk sesi baru
          await supabase.from('cbt_attempts').insert({
            user_id: userId,
            exam_id: parsedUser.active_exam_id,
            violations_count: 0,
            score: 0,
            status_passing: 'PENDING',
            updated_at: new Date().toISOString()
          });
          setIsDone(false);
          setStatusPassing('PENDING');
          localStorage.removeItem(`cbt_submitted_${parsedUser.active_exam_id}`);
        }
      }
      setLoading(false);
    };

    fetchAll();
    return () => window.removeEventListener('resize', onResize);
  }, [router]);

  // ── GENERATOR SURAT KELOLOSAN PDF ──────────────────────────────
  const generateCertificatePDF = async () => {
    const element = certificateRef.current;
    if (!element) return;
    setIsGeneratingPDF(true);
    try {
      // Tampilkan elemen sementara untuk di-render
      element.style.opacity = '1';
      element.style.position = 'fixed';
      element.style.top = '-9999px';
      element.style.left = '0';
      element.style.zIndex = '-1';

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      
      element.style.opacity = '0';
      element.style.position = 'absolute';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const namaPeserta = student?.full_name || student?.nama_lengkap || 'Peserta';
      pdf.save(`Surat_Kelolosan_NCC13_${namaPeserta.replace(/\s+/g, '_')}.pdf`);
      showToast("Surat Kelolosan berhasil diunduh!", "success");
    } catch (err) {
      showToast("Gagal membuat PDF. Coba lagi.", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ncc_user');
    router.push('/ujian/login');
  };

  const handleStartExam = () => {
    if (student?.active_exam_id && questionCount && questionCount > 0) {
      router.push(`/ujian/${student.active_exam_id}`);
    }
  };

  if (loading || !student) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 bg-indigo-100 rounded-full mx-auto flex items-center justify-center text-[#5145cd]">
            <ClockIcon className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Menyinkronkan Sesi...</p>
        </div>
      </div>
    );
  }

  const isExamReady = questionCount !== null && questionCount > 0;
  const ticketCode = student.id ? `NCC-${generateTicketCode(student.id)}` : (student.nisn || '-');
  const namaPeserta = student.full_name || student.nama_lengkap || 'Peserta NCC';
  const sekolahPeserta = student.school_name || student.school || '-';

  return (
    <div className="min-h-screen bg-[#f4f7fe] p-6 md:p-10 font-sans select-none text-gray-800 relative">

      {/* ══════════════════════════════════════════════════════════
          MODAL SELEBRASI KELOLOSAN
      ══════════════════════════════════════════════════════════ */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          {/* Hujan Konfetti */}
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={600}
            gravity={0.15}
          />

          <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Aksen dekorasi */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <div className="absolute top-8 right-8 text-6xl select-none">🎉</div>
            <div className="absolute bottom-8 left-8 text-4xl select-none">🏆</div>

            {/* Ikon mahkota */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-200 mb-5 relative z-10">
              <span className="text-4xl">🥇</span>
            </div>

            <h2 className="text-3xl font-black text-emerald-600 mb-1 relative z-10">
              SELAMAT LOLOS!
            </h2>
            <p className="text-base font-bold text-gray-800 mb-1 relative z-10">{namaPeserta}</p>
            <p className="text-xs text-gray-400 font-medium mb-6 relative z-10">
              Kamu resmi melangkah ke babak selanjutnya di<br />
              <strong className="text-indigo-600">National Creativity Competition 13th</strong>
            </p>

            {/* Tombol unduh PDF */}
            <button
              onClick={generateCertificatePDF}
              disabled={isGeneratingPDF}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 relative z-10"
            >
              {isGeneratingPDF ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Membuat PDF...</>
              ) : (
                <><span>📄</span> Unduh Surat Kelolosan (PDF)</>
              )}
            </button>

            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 font-bold transition-all relative z-10"
            >
              Tutup & Lihat Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TEMPLATE SERTIFIKAT (HIDDEN — hanya untuk di-render ke PDF)
      ══════════════════════════════════════════════════════════ */}
      <div
        ref={certificateRef}
        style={{ opacity: 0, position: 'absolute', top: '-9999px', left: 0, zIndex: -1 }}
        className="w-[1123px] bg-white font-sans"
      >
        {/* Border luar */}
        <div className="m-6 border-[6px] border-emerald-700 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[750px] relative overflow-hidden">
          {/* Aksen pojok */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-emerald-700 rounded-tl-xl" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-emerald-700 rounded-tr-xl" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-emerald-700 rounded-bl-xl" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-emerald-700 rounded-br-xl" />

          {/* Header kop */}
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">SMA Darul Ulum 1 Unggulan BPP-Teknologi</p>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-widest mb-1">Surat Pernyataan Kelolosan</h1>
            <h2 className="text-xl font-bold text-emerald-700 uppercase tracking-wider">National Creativity Competition 13th</h2>
            <div className="mt-4 w-32 h-1 bg-emerald-600 mx-auto rounded-full" />
          </div>

          {/* Badan surat */}
          <p className="text-lg text-gray-600 mb-2 font-medium">Dengan bangga diberikan kepada:</p>
          <p className="text-5xl font-black text-gray-900 border-b-4 border-gray-900 pb-3 mb-3 px-8 text-center">{namaPeserta}</p>
          <p className="text-xl font-bold text-gray-500 mb-10 text-center">{sekolahPeserta}</p>

          <p className="text-base text-gray-600 max-w-3xl text-center leading-loose">
            Telah dinyatakan <strong className="text-emerald-600">LOLOS</strong> dan berhak melanjutkan perjuangan ke tahap berikutnya dalam kompetisi tingkat nasional NCC 13th. Pencapaian ini merupakan bukti nyata dedikasi, kemampuan, dan semangat juang yang luar biasa.
          </p>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-200 w-full flex justify-between items-end text-xs text-gray-400">
            <div>
              <p className="font-mono font-bold text-gray-500">ID Tiket: {ticketCode}</p>
              <p>Dokumen resmi NCC 13th</p>
            </div>
            <div className="text-right">
              <p>Jombang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-gray-500">Panitia NCC 13th</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TOAST NOTIFICATION
      ══════════════════════════════════════════════════════════ */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`text-white px-6 py-4 rounded-2xl shadow-xl flex items-center border 
            ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 shadow-emerald-200' : 'bg-rose-500 border-rose-400 shadow-rose-200'}`}>
            <ShieldCheckIcon className="w-5 h-5 mr-3" />
            <p className="text-sm font-black tracking-wide">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          BANNER STATUS KELULUSAN (di bawah topbar, di atas konten)
      ══════════════════════════════════════════════════════════ */}

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP BAR / NAVIGASI */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 px-6 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#5145cd] text-white rounded-full flex items-center justify-center font-black text-lg shadow-sm">N</div>
            <div>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CBT Dashboard</p>
               <h2 className="text-sm font-bold text-[#5145cd]">Peserta Cabang {student.branch || student.lomba || 'MIPA'}</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center px-4 py-2 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
            <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" /> Keluar Sesi
          </button>
        </div>

        {/* BANNER HASIL KELULUSAN */}
        {statusPassing === 'PASSED' && (
          <div
            className="flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-lg shadow-emerald-200 cursor-pointer group"
            onClick={() => setShowCelebration(true)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-black text-sm uppercase tracking-wider">Selamat! Kamu Dinyatakan LOLOS</p>
                <p className="text-xs text-emerald-100 font-medium">Klik untuk buka selebrasi & unduh Surat Kelolosan</p>
              </div>
            </div>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        )}

        {statusPassing === 'FAILED' && (
          <div className="flex items-center gap-4 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl">
            <span className="text-2xl">😔</span>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">Belum Lolos Tahap Ini</p>
              <p className="text-xs text-rose-500 font-medium">Jangan menyerah! Tetap semangat dan terus berkarya.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PROFIL PESERTA */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#5145cd]"></div>
            <div className="w-20 h-20 bg-gray-50 border-4 border-white rounded-full flex items-center justify-center text-gray-300 shadow-md mb-5 mt-2">
              <UserIcon className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-black text-gray-900 leading-snug">{namaPeserta}</h2>
            <p className="text-[10px] font-bold text-indigo-600 mt-1.5 bg-indigo-50 px-3 py-1 rounded-full font-mono tracking-widest border border-indigo-100">
              {ticketCode}
            </p>
            <div className="w-full border-t border-gray-100 mt-8 pt-6 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori</span>
                <span className="font-black text-[#5145cd] bg-indigo-50 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">{student.branch || student.lomba || 'MIPA'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                <span className={`font-black px-3 py-1 rounded-full text-[10px] flex items-center uppercase tracking-wider
                  ${statusPassing === 'PASSED' ? 'text-emerald-600 bg-emerald-50' : statusPassing === 'FAILED' ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'}`}>
                  <ShieldCheckIcon className="w-3.5 h-3.5 mr-1" />
                  {statusPassing === 'PASSED' ? 'LOLOS' : statusPassing === 'FAILED' ? 'TIDAK LOLOS' : 'Menunggu'}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {/* KOTAK SESI UJIAN */}
            <div className={`p-8 rounded-[32px] shadow-sm border transition-all ${isExamReady ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isExamReady ? 'bg-amber-50 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                    {isExamReady ? 'Sesi Tersedia' : 'Belum Ada Soal'}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 mt-3 tracking-tight">
                    {student.active_exam_title || 'Sesi Ujian'}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-xs font-bold text-gray-400 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1 text-[#5145cd]" /> {examDetail?.duration || 90} Menit
                    </p>
                    <p className="text-xs font-bold text-gray-400 flex items-center">
                      — {questionCount} Soal
                    </p>
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border ${isExamReady ? 'bg-indigo-50 text-[#5145cd] border-indigo-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  <AcademicCapIcon className="w-7 h-7" />
                </div>
              </div>

              {!isExamReady && (
                <div className="mt-6 p-4 bg-amber-50 rounded-2xl flex items-start text-amber-700 border border-amber-200">
                  <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">
                    Panitia belum memasukkan soal untuk sesi ini. Silakan tunggu atau hubungi panitia.
                  </p>
                </div>
              )}

              {isDone ? (
                <div className="mt-6 py-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-sm">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" /> Ujian Telah Diselesaikan
                </div>
              ) : (
                <button
                  onClick={handleStartExam}
                  disabled={!isExamReady}
                  className={`w-full mt-6 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center space-x-2 group
                    ${isExamReady 
                      ? 'bg-[#5145cd] hover:bg-[#3d32a8] active:scale-[0.99] text-white shadow-lg shadow-indigo-200' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <span>{isExamReady ? 'Masuk Ruang Ujian' : 'Akses Terkunci'}</span>
                  {isExamReady && <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                </button>
              )}
            </div>

            {/* PROTOKOL INTEGRITAS */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center mb-5">
                <ShieldExclamationIcon className="w-4 h-4 mr-2 text-amber-500" /> Protokol Integritas CBT
              </h4>
              <ul className="text-xs text-gray-500 space-y-4">
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-black text-[10px] mr-3 flex-shrink-0 mt-0.5">1</div>
                  <span className="leading-relaxed"><strong>Sistem Anti-Tab:</strong> Keluar dari layar ujian atau berpindah tab akan tercatat secara otomatis oleh Pusat Komando sebagai upaya diskualifikasi.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
