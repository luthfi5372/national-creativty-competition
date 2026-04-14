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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-100"
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
        fixed top-12 left-0 bottom-0 w-64 bg-[#000] border-r border-white/10 z-40
        transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full">
          {/* Dashboard Context Switcher (Vercel Style) */}
          <div className="p-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg group cursor-pointer hover:bg-white/10 transition-colors">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">NCC Competition</p>
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
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-all group
                    ${isActive 
                      ? "bg-white/5 text-white border border-white/10 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"}
                  `}
                >
                  <item.icon size={16} strokeWidth={1.5} className={isActive ? "text-indigo-400" : "group-hover:text-white transition-colors"} />
                  <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Footer Profile (Vercel Style) */}
          <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center font-black text-[10px] text-white">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">System Admin</p>
                <p className="text-[9px] text-slate-500 font-bold truncate hover:text-indigo-400 cursor-pointer">View Profile</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group border border-transparent hover:border-white/10"
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
