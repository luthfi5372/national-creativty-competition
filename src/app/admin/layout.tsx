"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/localAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const session = getSession();
    
    if (!session || session.role !== "admin") {
      router.push("/"); // Redirect if not admin
    } else {
      setAuthorized(true);
      // Load theme preference
      const savedTheme = localStorage.getItem("admin-theme") as "dark" | "light";
      if (savedTheme) setTheme(savedTheme);
    }
    setLoading(false);
  }, [router]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div 
      className={`min-h-screen transition-all duration-500 font-inter selection:bg-indigo-500/30 ${
        theme === "dark" ? "bg-[#000] text-white" : "bg-slate-50 text-slate-900"
      }`}
      style={{
        // @ts-ignore
        "--admin-bg": theme === "dark" ? "#000" : "#ffffff",
        "--admin-panel": theme === "dark" ? "#0a0a0a" : "#f8fafc",
        "--admin-border": theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
        "--admin-text": theme === "dark" ? "#ffffff" : "#0f172a",
        "--admin-text-slate": theme === "dark" ? "#94a3b8" : "#64748b",
        "--admin-card": theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
      }}
    >
      {/* Vercel-style Top Status Bar */}
      <div className={`h-12 border-b flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-500 ${
        theme === "dark" 
          ? "bg-[#000] border-white/10" 
          : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          }`}>
            Environment: Production
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold">
          <span className={theme === "dark" ? "text-slate-500" : "text-slate-400"}>v1.0.2</span>
          <span className={`w-[1px] h-3 ${theme === "dark" ? "bg-white/10" : "bg-slate-200"}`} />
          <span className="text-emerald-500">All Systems Operational</span>
        </div>
      </div>

      <div className="flex">
        <AdminSidebar theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 lg:pl-64 min-h-screen">
          <div className="p-6 lg:p-12 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
