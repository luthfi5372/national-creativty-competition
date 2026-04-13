"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Download, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getAllCompetitionEntries, 
  deleteCompetitionEntry, 
  adminUpdateCompetitionEntry,
  adminUpdateUserPassword,
  submitCompetitionEntry,
  CompetitionEntry,
  addAdminLog,
  adminFinalizePayment
} from "@/lib/localAuth";

export default function AdminParticipants() {
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState<string | null>(null); // email of user
  const [newPass, setNewPass] = useState("");
  const [viewProof, setViewProof] = useState<CompetitionEntry | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Add Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    school: "",
    category: "Olimpiade MIPA",
    city: "Jakarta",
    teamSize: "1",
    notes: ""
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setEntries(getAllCompetitionEntries());
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitCompetitionEntry({
      ...formData,
      paymentStatus: "Verified"
    });
    if (res.success) {
      addAdminLog(`Manually registered participant: ${formData.email} (${formData.category})`);
      setShowAddModal(false);
      refreshData();
    } else {
      alert(res.error);
    }
  };

  const handlePassReset = () => {
    if (showPassModal) {
      const res = adminUpdateUserPassword(showPassModal, newPass);
      if (res.success) {
        addAdminLog(`Reset password for user: ${showPassModal}`);
        alert("Password updated successfully.");
        setShowPassModal(null);
        setNewPass("");
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this participant? This action is permanent.")) {
      deleteCompetitionEntry(id);
      addAdminLog(`Deleted competition entry: ID ${id}`);
      refreshData();
    }
  };

  const handleUpdateStatus = (id: string, status: any) => {
    adminUpdateCompetitionEntry(id, { paymentStatus: status });
    addAdminLog(`Updated payment status for Entry ID ${id} to ${status}`);
    refreshData();
  };

  const handleVerifyPayment = async (id: string) => {
    setIsVerifying(true);
    // Tiny delay for feedback
    await new Promise(r => setTimeout(r, 500));
    
    const res = adminFinalizePayment(id);
    if (res.success) {
      setViewProof(null);
      refreshData();
    } else {
      alert(res.error);
    }
    setIsVerifying(false);
  };

  const handleRejectPayment = (id: string) => {
    if (confirm("Reject this payment proof? Status will return to Pending.")) {
      adminUpdateCompetitionEntry(id, { paymentStatus: "Wait", paymentProofUrl: undefined });
      addAdminLog(`Rejected payment proof for Entry ID ${id}`);
      setViewProof(null);
      refreshData();
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.school.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified": return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100"><CheckCircle size={12} /> Verified</span>;
      case "Wait": return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100"><Clock size={12} /> Pending</span>;
      case "Paid": return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100"><CheckCircle size={12} /> Paid</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">None</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Participant Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage, verify, and monitor all competition registrants.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-200"
          >
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative"
            >
               <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900">
                  <ChevronRight className="rotate-90 md:rotate-0" />
               </button>
               <h3 className="text-2xl font-black text-slate-900 mb-6">Manual Registration</h3>
               <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input required type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Olimpiade MIPA</option>
                        <option>Speech Contest</option>
                        <option>LKTI Nasional</option>
                        <option>MTQ Nasional</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">School</label>
                        <input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" onChange={e => setFormData({...formData, school: e.target.value})} />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest mt-4">Save Participant</button>
               </form>
            </motion.div>
          </div>
        )}

        {showPassModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
               <h3 className="text-xl font-black text-slate-900 mb-2">Reset Password</h3>
               <p className="text-xs text-slate-500 mb-6 font-medium">Resetting password for: {showPassModal}</p>
               <input 
                type="password" 
                placeholder="New Password" 
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold mb-4 focus:ring-2 focus:ring-indigo-500/20 outline-none" 
               />
               <div className="flex gap-3">
                 <button onClick={() => setShowPassModal(null)} className="flex-1 py-3 text-xs font-black uppercase text-slate-400">Cancel</button>
                 <button onClick={handlePassReset} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase">Confirm</button>
               </div>
            </motion.div>
          </div>
        )}

        {viewProof && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewProof(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-indigo-500/20"
            >
              <div className="flex-1 bg-slate-50 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 min-h-[300px]">
                {viewProof.paymentProofUrl ? (
                  <img src={viewProof.paymentProofUrl} alt="Payment Proof" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-lg border border-white" />
                ) : (
                  <div className="text-center p-10">
                    <FileText size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No proof uploaded</p>
                  </div>
                )}
              </div>
              <div className="w-full md:w-80 p-10 flex flex-col justify-between bg-white">
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Participant</div>
                    <div className="text-lg font-black text-slate-900 leading-tight">{viewProof.fullName}</div>
                    <div className="text-xs text-slate-400 font-medium">{viewProof.email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Category</div>
                    <div className="text-sm font-bold text-slate-700">{viewProof.category}</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Payment Status</div>
                    <div className="text-xs font-bold text-amber-700">{viewProof.paymentStatus === "Paid" ? "Awaiting Verification" : viewProof.paymentStatus}</div>
                  </div>
                </div>

                <div className="pt-10 flex flex-col gap-3">
                  {viewProof.paymentStatus === "Paid" && (
                    <>
                      <button 
                        onClick={() => handleVerifyPayment(viewProof.id)}
                        disabled={isVerifying}
                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                      >
                        {isVerifying ? "Processing..." : <><CheckCircle2 size={16}/> Approve Payment</>}
                      </button>
                      <button 
                        onClick={() => handleRejectPayment(viewProof.id)}
                        className="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"
                      >
                         Reject & Reset Status
                      </button>
                    </>
                  )}
                  <button onClick={() => setViewProof(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Close Preview</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or school..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
             <Filter size={16} className="text-slate-400" />
             <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none"
             >
                <option value="All">All Categories</option>
                <option value="Olimpiade MIPA">MIPA</option>
                <option value="Speech Contest">Speech</option>
                <option value="LKTI Nasional">LKTI</option>
                <option value="MTQ Nasional">MTQ</option>
             </select>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Proof</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, idx) => (
                  <motion.tr 
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                          {entry.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{entry.fullName}</div>
                          <div className="text-[11px] font-medium text-slate-400">{entry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs font-bold text-slate-600">{entry.category}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Team: {entry.teamSize}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-xs font-bold text-slate-600">{entry.city}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{entry.school}</div>
                    </td>
                    <td className="px-6 py-6">
                      {getStatusBadge(entry.paymentStatus)}
                    </td>
                    <td className="px-6 py-6 text-center">
                      {entry.paymentProofUrl ? (
                        <button 
                          onClick={() => setViewProof(entry)} 
                          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                          title="View Proof"
                        >
                          <Eye size={16} />
                        </button>
                      ) : (
                        <span className="text-slate-200"><FileText size={16} className="mx-auto" /></span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-[11px] font-bold text-slate-500">
                        {new Date(entry.submittedAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setShowPassModal(entry.email)}
                          className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-all" 
                          title="Reset User Password"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(entry.id, entry.paymentStatus === "Verified" ? "Paid" : "Verified")}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Verify/Pay"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredEntries.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900">No Participants Found</h3>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search filters if needed.</p>
          </div>
        )}

        {/* Pagination Placeholder */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredEntries.length} entries</span>
           <div className="flex items-center gap-2">
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-all"><ChevronLeft size={20}/></button>
             <button className="p-2 text-slate-400 hover:text-slate-600 transition-all"><ChevronRight size={20}/></button>
           </div>
        </div>
      </div>
    </div>
  );
}
