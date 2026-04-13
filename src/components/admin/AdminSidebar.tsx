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
        fixed top-0 left-0 bottom-0 w-64 bg-white/80 backdrop-blur-2xl border-r border-slate-100 z-40
        transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">NCC Admin</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Control Center</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group
                    ${isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                  `}
                >
                  <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                  <span className="font-bold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
