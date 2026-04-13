"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShineBorder } from "@/components/ui/ShineBorder";
import { submitCompetitionEntryToSupabase } from "@/lib/supabase/service";
import { getSystemSettings } from "@/lib/localAuth";
import {
  User, Mail, Phone, Building2, BookOpen, Mic, Medal, MapPin,
  Users, FileText, ArrowRight, CheckCircle2, Loader2, Trophy, Info, AlertCircle
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "Olimpiade MIPA", label: "Olimpiade MIPA", icon: BookOpen, color: "bg-blue-500" },
  { value: "Speech Contest", label: "Speech Contest", icon: Mic, color: "bg-emerald-500" },
  { value: "LKTI Nasional", label: "LKTI Nasional", icon: Medal, color: "bg-yellow-500" },
  { value: "Lainnya", label: "Lainnya", icon: FileText, color: "bg-purple-500" },
];

const TEAM_SIZES = ["Individu (1 orang)", "2 orang", "3 orang", "4-5 orang"];

const STAGES = [
  { step: 1, label: "Data Diri", icon: User },
  { step: 2, label: "Kategori", icon: Trophy },
  { step: 3, label: "Konfirmasi", icon: CheckCircle2 },
];

export default function DaftarPage() {
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [regOpen, setRegOpen] = useState(true);

  // Form data
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    school: "",
    city: "",
    category: "",
    teamSize: "",
    notes: "",
  });

  useEffect(() => {
    const settings = getSystemSettings();
    setRegOpen(settings.registrationOpen);
  }, []);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleNext = () => {
    setError(null);
    if (!regOpen) return;
    if (stage === 1) {
      if (!form.fullName || !form.email || !form.phone || !form.school || !form.city) {
        setError("Semua kolom wajib diisi!");
        return;
      }
    }
    if (stage === 2) {
      if (!form.category || !form.teamSize) {
        setError("Pilih kategori dan jumlah tim!");
        return;
      }
    }
    setStage((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!regOpen) return;
    setLoading(true);
    setError(null);
    
    // Save to Supabase
    const { error: supabaseError } = await submitCompetitionEntryToSupabase(form);
    
    if (!supabaseError) {
      setSubmitted(true);
    } else {
      console.error("Supabase submission error:", supabaseError);
      setError("Gagal mengirim pendaftaran ke database. Pastikan koneksi internet stabil.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 pt-24 pb-16 px-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium"
        >
          <Trophy size={14} /> NCC 13th · Pendaftaran Kompetisi
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Mulai Pendaftaran
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg leading-relaxed"
        >
          Isi formulir di bawah ini untuk mendaftarkan diri / tim ke kompetisi NCC 13.
        </motion.p>
      </div>

      {!regOpen ? (
        <div className="max-w-lg mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] border border-rose-100 p-12 text-center shadow-2xl shadow-rose-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl -mr-16 -mt-16 rounded-full" />
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4 relative z-10">Registrasi Ditutup</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 relative z-10">
              Pendaftaran kompetisi NCC 13th saat ini telah ditutup. Silakan pantau media sosial kami untuk informasi pembukaan gelombang selanjutnya.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Kembali ke Beranda
            </Link>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-0 mb-10 max-w-sm mx-auto">
            {STAGES.map((s, i) => (
              <div key={s.step} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: stage >= s.step ? "#4f46e5" : "#e2e8f0",
                    color: stage >= s.step ? "#ffffff" : "#94a3b8",
                    scale: stage === s.step ? 1.15 : 1,
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-colors"
                >
                  {stage > s.step ? <CheckCircle2 size={18} /> : s.step}
                </motion.div>
                <span className={`ml-2 text-xs font-medium ${stage >= s.step ? "text-indigo-600" : "text-slate-400"}`}>{s.label}</span>
                {i < STAGES.length - 1 && <div className={`w-8 h-0.5 mx-3 transition-colors ${stage > s.step ? "bg-indigo-400" : "bg-slate-200"}`} />}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <ShineBorder colors={["#10b981", "#6366f1", "#10b981"]} duration={4} borderWidth={2}>
                    <div className="p-12 flex flex-col items-center gap-5">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle2 size={44} className="text-emerald-500" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-slate-900">Pendaftaran Terkirim! 🎉</h2>
                      <p className="text-slate-500 text-sm leading-relaxed text-center max-w-xs">
                        Data pendaftaran Anda untuk <strong>{form.category}</strong> telah kami terima. Tim NCC akan menghubungi melalui email <strong>{form.email}</strong>.
                      </p>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full text-left text-sm">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Nama</span>
                          <span className="font-medium text-slate-900">{form.fullName}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Kategori</span>
                          <span className="font-medium text-slate-900">{form.category}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Tim</span>
                          <span className="font-medium text-slate-900">{form.teamSize}</span>
                        </div>
                      </div>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Kembali ke Beranda
                      </Link>
                    </div>
                  </ShineBorder>
                </motion.div>
              ) : (
                <motion.div key={`stage-${stage}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <ShineBorder
                    colors={["#6366f1", "#a855f7", "#ec4899", "#6366f1"]}
                    duration={6}
                    borderWidth={1.5}
                  >
                    <div className="p-8">
                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-2 p-3.5 mb-5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl"
                          >
                            <span>⚠️</span> {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* STAGE 1: Data Diri */}
                      {stage === 1 && (
                        <div className="flex flex-col gap-4">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">📋 Data Diri Peserta</h3>

                          {[
                            { label: "Nama Lengkap", key: "fullName", type: "text", icon: User, placeholder: "Nama lengkap / nama tim" },
                            { label: "Email Aktif", key: "email", type: "email", icon: Mail, placeholder: "nama@email.com" },
                            { label: "No. WhatsApp", key: "phone", type: "tel", icon: Phone, placeholder: "08xxxxxxxxxx" },
                            { label: "Asal Sekolah / Instansi", key: "school", type: "text", icon: Building2, placeholder: "SMA Negeri 1 ..." },
                            { label: "Kota / Provinsi", key: "city", type: "text", icon: MapPin, placeholder: "Jakarta, DKI Jakarta" },
                          ].map((field) => (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                              <div className="relative">
                                <field.icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                  type={field.type}
                                  value={form[field.key as keyof typeof form]}
                                  onChange={(e) => update(field.key, e.target.value)}
                                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                  placeholder={field.placeholder}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* STAGE 2: Kategori */}
                      {stage === 2 && (
                        <div className="flex flex-col gap-5">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">🏆 Pilih Kategori Lomba</h3>

                          <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => update("category", cat.value)}
                                className={`relative p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${form.category === cat.value
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                                  }`}
                              >
                                <div className={`w-8 h-8 ${cat.color} rounded-lg flex items-center justify-center mb-2`}>
                                  <cat.icon size={16} className="text-white" />
                                </div>
                                <div className="text-sm font-semibold text-slate-800">{cat.label}</div>
                                {form.category === cat.value && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={12} className="text-white" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              <Users size={14} className="inline mr-1.5" />
                              Jumlah Anggota Tim
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {TEAM_SIZES.map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => update("teamSize", size)}
                                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${form.teamSize === size
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                    }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              <FileText size={14} className="inline mr-1.5" />
                              Catatan Tambahan <span className="text-slate-400 font-normal">(opsional)</span>
                            </label>
                            <textarea
                              value={form.notes}
                              onChange={(e) => update("notes", e.target.value)}
                              rows={3}
                              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all text-sm resize-none"
                              placeholder="Pertanyaan, atau informasi tambahan yang perlu kami ketahui..."
                            />
                          </div>
                        </div>
                      )}

                      {/* STAGE 3: Konfirmasi */}
                      {stage === 3 && (
                        <div className="flex flex-col gap-4">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">✅ Konfirmasi Data</h3>
                          <p className="text-sm text-slate-500">Periksa kembali data Anda sebelum mengirim.</p>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 divide-y divide-slate-100">
                            {[
                              { label: "Nama", value: form.fullName },
                              { label: "Email", value: form.email },
                              { label: "WhatsApp", value: form.phone },
                              { label: "Sekolah", value: form.school },
                              { label: "Kota", value: form.city },
                              { label: "Kategori", value: form.category },
                              { label: "Jumlah Tim", value: form.teamSize },
                            ].map((row) => (
                              <div key={row.label} className="flex justify-between py-2.5 text-sm">
                                <span className="text-slate-500">{row.label}</span>
                                <span className="font-semibold text-slate-900 text-right max-w-[60%]">{row.value}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <span>Dengan mengirim, Anda menyetujui bahwa data yang diberikan sudah benar and sesuai.</span>
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex gap-3 mt-6">
                        {stage > 1 && (
                          <button
                            type="button"
                            onClick={() => setStage((s) => s - 1)}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            ← Kembali
                          </button>
                        )}

                        {stage < 3 ? (
                          <motion.button
                            type="button"
                            onClick={handleNext}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-[2] flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                          >
                            Lanjutkan <ArrowRight size={16} />
                          </motion.button>
                        ) : (
                          <motion.button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-[2] flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition-all shadow-md shadow-indigo-200"
                          >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Kirim Pendaftaran <ArrowRight size={16} /></>}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </ShineBorder>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
