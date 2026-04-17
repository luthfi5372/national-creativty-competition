"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  MessageSquare, 
  Settings, 
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Image as ImageIcon,
  ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/lib/localAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Participants", href: "/admin/participants" },
  { icon: ShieldAlert, label: "User Accounts", href: "/admin/users" },
  { icon: ImageIcon, label: "Media Manager", href: "/admin/media" },
  { icon: Map, label: "Regional Insights", href: "/admin/insights" },
  { icon: MessageSquare, label: "Communications", href: "/admin/messages" },
];

interface AdminSidebarProps {
  theme?: "dark" | "light";
  toggleTheme?: () => void;
}

export default function AdminSidebar({ theme = "dark", toggleTheme }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isDark = theme === "dark";

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg border transition-colors ${
          isDark ? "bg-[#111] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-12 left-0 bottom-0 w-64 border-r z-40
        transition-all duration-300 ease-out
        ${isDark ? "bg-[#000] border-white/10" : "bg-white border-slate-200"}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full">
          {/* Dashboard Context Switcher (Vercel Style) */}
          <div className={`p-4 border-b mb-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg group cursor-pointer transition-colors ${
              isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}>
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className={`text-[11px] font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>NCC Competition</p>
                <p className="text-[9px] text-slate-500 font-bold truncate">Command Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all group border
                    ${isActive 
                      ? (isDark ? "bg-white/5 text-white border-white/10 shadow-sm" : "bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm") 
                      : (isDark ? "text-slate-400 hover:text-white hover:bg-white/5 border-transparent" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent")}
                  `}
                >
                  <item.icon size={16} strokeWidth={1.5} className={isActive ? "text-indigo-500" : (isDark ? "group-hover:text-white transition-colors" : "group-hover:text-slate-900 transition-colors")} />
                  <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & User Profile */}
          <div className={`p-4 border-t ${isDark ? "border-white/10 bg-[#0a0a0a]" : "border-slate-100 bg-slate-50/50"}`}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 w-full px-3 py-2 mb-4 rounded-lg transition-all group border ${
                isDark 
                  ? "text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-white border-transparent hover:border-slate-200 shadow-sm bg-white/50"
              }`}
            >
              {isDark ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                  <span className="font-bold text-[13px]">Light Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="font-bold text-[13px]">Dark Mode</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center font-black text-[10px] text-white">
                AD
              </div>
              <div className="overflow-hidden">
                <p className={`text-[11px] font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>System Admin</p>
                <p className="text-[9px] text-slate-500 font-bold truncate hover:text-indigo-400 cursor-pointer">View Profile</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all group border ${
                isDark 
                  ? "text-slate-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10" 
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-100"
              }`}
            >
              <LogOut size={16} strokeWidth={1.5} />
              <span className="font-bold text-[13px]">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
