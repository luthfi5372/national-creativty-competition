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

  useEffect(() => {
    const session = getSession();
    
    if (!session || session.role !== "admin") {
      router.push("/"); // Redirect if not admin
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#000] text-white font-inter selection:bg-indigo-500/30">
      {/* Vercel-style Top Status Bar */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-[#000] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Environment: Production</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-[11px] font-bold">
          <span>v1.0.2</span>
          <span className="w-[1px] h-3 bg-white/10" />
          <span className="text-emerald-400">All Systems Operational</span>
        </div>
      </div>

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:pl-64 min-h-screen">
          <div className="p-6 lg:p-12 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
