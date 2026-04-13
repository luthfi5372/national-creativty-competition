"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerLocalUser } from "@/app/actions/auth";
import { Mail, Lock, User, Building2, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerLocalUser(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } else {
      setError(result.error ?? "Terjadi kesalahan.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Akun Berhasil Dibuat!</h3>
        <p className="text-sm text-slate-500">Anda akan diarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm bg-red-50 border border-red-200 text-red-600 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Nama Lengkap */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nama Lengkap <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <User size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            name="fullName"
            required
            autoComplete="name"
            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm shadow-sm"
            placeholder="Nama Lengkap Anda"
          />
        </div>
      </div>

      {/* Asal Sekolah */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Asal Sekolah / Instansi <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Building2 size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            name="school"
            required
            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm shadow-sm"
            placeholder="SMA Negeri 1 ..."
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Alamat Email <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Mail size={16} className="text-slate-400" />
          </div>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm shadow-sm"
            placeholder="nama@email.com"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Kata Sandi <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock size={16} className="text-slate-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm shadow-sm"
            placeholder="Minimal 6 karakter"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 ml-1">Minimal 6 karakter</p>
      </div>

      {/* Syarat */}
      <div className="flex items-start gap-2">
        <input
          id="terms"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
          Dengan mendaftar, saya menyetujui{" "}
          <a href="#" className="text-indigo-600 hover:underline font-medium">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="#" className="text-indigo-600 hover:underline font-medium">
            Kebijakan Privasi
          </a>{" "}
          NCC.
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Buat Akun Peserta"}
      </button>
    </form>
  );
}
