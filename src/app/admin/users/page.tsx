"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  User, 
  Shield, 
  Clock, 
  Calendar,
  Mail,
  Phone,
  School,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getUsers, 
  adminGetFullUserDetail,
  LocalUser,
  CompetitionEntry 
} from "@/lib/localAuth";

export default function UserManagement() {
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState<{ user: LocalUser; entries: CompetitionEntry[] } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(getUsers());
  };

  const handleViewDetails = async (email: string) => {
    setIsLoadingDetails(true);
    // Simulate loading for better UX
    await new Promise(r => setTimeout(r, 600));
    const details = adminGetFullUserDetail(email);
    if (details.user) {
      setSelectedUser({ user: details.user, entries: details.entries });
    }
    setIsLoadingDetails(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || u.role === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Accounts</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Manage and monitor all registered accounts in the NCC ecosystem.</p>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                 <User size={24} />
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Accounts</span>
           </div>
           <div className="text-4xl font-black text-slate-900">{users.length}</div>
           <p className="text-xs text-slate-400 font-medium mt-2">Active registered users</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                 <Shield size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Admins</span>
           </div>
           <div className="text-4xl font-black text-slate-900">{users.filter(u => u.role === 'admin').length}</div>
           <p className="text-xs text-slate-400 font-medium mt-2">privileged accounts</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                 <Calendar size={24} />
              </div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">New Today</span>
           </div>
           <div className="text-4xl font-black text-slate-900">
             {users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length}
           </div>
           <p className="text-xs text-slate-400 font-medium mt-2">Joined in last 24h</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search accounts by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3">
           <Filter size={16} className="text-slate-400" />
           <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none outline-none"
           >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
           </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((u) => (
                  <motion.tr 
                    key={u.email}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {u.fullName.charAt(0)}
                        </div>
                        <div className="text-sm font-black text-slate-900">{u.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-medium text-slate-500 text-sm">{u.email}</td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        u.role === 'admin' 
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                          : "bg-slate-50 text-slate-400 border-slate-100"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-mono text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => handleViewDetails(u.email)}
                        className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:bg-white border border-slate-100"
                       >
                          View Details
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-indigo-500/10"
            >
               {/* Left: Profile Sidebar */}
               <div className="w-full md:w-80 bg-slate-50 p-12 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex flex-col items-center text-center">
                     <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100 mb-6">
                        {selectedUser.user.fullName.charAt(0)}
                     </div>
                     <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedUser.user.fullName}</h3>
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedUser.user.role}</p>
                  </div>

                  <div className="mt-12 space-y-8">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                           <Mail size={12} /> Email
                        </div>
                        <div className="text-sm font-bold text-slate-700 truncate">{selectedUser.user.email}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                           <Phone size={12} /> WhatsApp
                        </div>
                        <div className="text-sm font-bold text-slate-700">{selectedUser.user.phone || "-"}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                           <School size={12} /> Institution
                        </div>
                        <div className="text-sm font-bold text-slate-700">{selectedUser.user.school}</div>
                     </div>
                  </div>
               </div>

               {/* Right: Activity & Competitions */}
               <div className="flex-1 p-12 overflow-y-auto max-h-[85vh]">
                  <div className="flex justify-between items-center mb-10">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Activity History</h4>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><X /></button>
                  </div>

                  <div className="space-y-10">
                     {/* Competition Participation */}
                     <div>
                        <div className="flex items-center gap-2 mb-6">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competition Registrations</h5>
                           <div className="flex-1 h-[1px] bg-slate-100" />
                        </div>
                        
                        {selectedUser.entries.length === 0 ? (
                           <div className="p-10 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
                             <CreditCard size={32} className="mx-auto text-slate-200 mb-3" />
                             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No competition entries found</p>
                           </div>
                        ) : (
                          <div className="grid gap-4">
                            {selectedUser.entries.map(entry => (
                              <div key={entry.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                       <CreditCard size={20} />
                                    </div>
                                    <div>
                                       <div className="text-sm font-black text-slate-900">{entry.category}</div>
                                       <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(entry.submittedAt).toLocaleDateString()}</div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                      entry.paymentStatus === 'Verified' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                      entry.paymentStatus === 'Paid' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                      "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}>
                                       {entry.paymentStatus}
                                    </span>
                                 </div>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>

                     {/* Account Metadata */}
                     <div className="grid grid-cols-2 gap-6 p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                        <div className="space-y-1">
                           <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Member Since</div>
                           <div className="text-lg font-black">{new Date(selectedUser.user.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">ID Reference</div>
                           <div className="text-lg font-black font-mono">#{selectedUser.user.email.slice(0, 4).toUpperCase()}</div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoadingDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-sm">
           <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Fetching Profile...</p>
           </div>
        </div>
      )}
    </div>
  );
}
