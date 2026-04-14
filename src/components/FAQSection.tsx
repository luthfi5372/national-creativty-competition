"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Berapa biaya pendaftaran minimum untuk LKTI?",
    a: "Tidak ada minimum biaya. Kami menerapkan sistem gelombang. Untuk Gelombang 1 biayanya Rp 50.000, sedangkan untuk Gelombang 2 adalah Rp 75.000. Harga berlaku untuk satu tim maksimal 3 anggota.",
  },
  {
    q: "Bagaimana cara melakukan registrasi sistem di Platform ini?",
    a: "Anda bisa langsung mengklik tombol pendaftaran (Daftar Tim) lalu mengisi formulir yang terhubung dengan Autentikasi Google atau Email. Semua anggota tim terintegrasi dalam 1 *Dashboard* untuk mengunggah karya.",
  },
  {
    q: "Apakah siswa SMA bisa mengikuti Lomba Speech Contest?",
    a: "Tentu. NCC edisi kali ini membagi braket perlombaan menjadi kategori Universitas (PT) dan kategori Pelajar (SMA/SMK Sederajat).",
  },
  {
    q: "Apa saja kriteria format penilaian untuk Kategori MIPA?",
    a: "Berbeda dengan babak tulis, babak penyisihan MIPA diselenggarakan otomatis lewat bank soal daring di situs web kami, sementara finalis yang lolos akan diundang secara luring (On-site).",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-6 py-12 h-full flex flex-col justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center mb-8 sm:mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Frequently <span className="text-indigo-600">Asked</span> Question
        </h2>
        <p className="text-slate-600 text-lg">
          Ada pertanyaan? Cek FAQ berikut sebelum mengirimkan support ticket.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`bg-white border rounded-2xl overflow-hidden transition-colors duration-300 shadow-sm ${isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <button
                className="w-full px-6 py-6 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="text-left font-bold text-slate-800 pr-8">{faq.q}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 pt-2 text-slate-600 text-sm leading-relaxed border-t border-slate-100 mt-2">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
