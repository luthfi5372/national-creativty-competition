"use client";

import { motion } from "framer-motion";
import { UserPlus, Send, CheckCircle, ArrowRight } from "lucide-react";

export default function RegistrationSection() {
  return (
    <section id="daftar" className="relative z-10 py-24 px-6 sm:px-10 bg-transparent">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900"
          style={{ fontFamily: "var(--font-display, var(--font-space-grotesk))" }}
        >
          Pendaftaran
        </h2>
        <p className="text-slate-600 text-lg">
          Tiga langkah mudah untuk bergabung di panggung nasional.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            step: 1,
            icon: UserPlus,
            title: "Buat Akun",
            desc: "Daftarkan diri atau tim kamu. Isi data lengkap dan pilih kategori lomba.",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            step: 2,
            icon: Send,
            title: "Kirim Karya",
            desc: "Unggah karya tulis, video presentasi, atau materi sesuai kategori yang dipilih.",
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
          },
          {
            step: 3,
            icon: CheckCircle,
            title: "Konfirmasi",
            desc: "Verifikasi pendaftaran kamu. Pantau status dan jadwal melalui dashboard.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, scale: 0.90, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: i * 0.1, 
                duration: 0.6, 
                type: "spring", 
                stiffness: 100, 
                damping: 15 
              }}
              whileHover={{ 
                y: -10, 
                scale: 1.03,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="bg-white border border-slate-200 rounded-3xl p-8 text-center relative shadow-sm cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-shadow"
            >
              {/* Step number */}
              <div className={`absolute -top-4 -right-2 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border bg-white ${item.border} ${item.color}`} style={{ fontFamily: "var(--font-display)" }}>
                {item.step}
              </div>

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 border ${item.bg} ${item.border}`}>
                <Icon size={26} className={item.color} />
              </div>

              <h3 className={`text-lg font-bold mb-3 ${item.color}`} style={{ fontFamily: "var(--font-display)" }}>
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Registration form placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="max-w-lg mx-auto"
      >
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg shadow-indigo-100/50">
          <h3
            className="text-xl font-bold text-slate-900 mb-6 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mulai Pendaftaran
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-600 mb-1.5 block font-medium">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1.5 block font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="email@contoh.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 mb-1.5 block font-medium">
                Kategori Lomba
              </label>
              <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all">
                <option value="">Pilih kategori...</option>
                <option value="speech">Speech Contest</option>
                <option value="lkti">LKTI</option>
                <option value="mtq">MTQ</option>
                <option value="mipa">Olimpiade MIPA</option>
              </select>
            </div>

            <button
              className="w-full mt-4 px-6 py-4 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md"
            >
              Kirim Pendaftaran
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
