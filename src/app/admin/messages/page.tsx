"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  MessageSquare, 
  Users, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  X,
  Zap,
  Info,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  sendAdminMessage, 
  getAdminMessages, 
  deleteAdminMessage,
  getUsers,
  AdminMessage,
  addAdminLog,
  LocalUser
} from "@/lib/localAuth";

export default function AdminMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<"all" | string>("all");
  const [priority, setPriority] = useState<"info" | "warning" | "urgent">("info");
  const [mediaUrl, setMediaUrl] = useState<string>("");

  useEffect(() => {
    refreshData();
    setUsers(getUsers());
  }, []);

  const refreshData = () => {
    setMessages(getAdminMessages().sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("File too large. Please use images under 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 800));

    const result = sendAdminMessage({
      title,
      content,
      target,
      sender: "System Admin",
      type: priority,
      mediaUrl: mediaUrl || undefined
    });

    if (result.success) {
      addAdminLog(`Dispatched ${priority} announcement: "${title}" to ${target}`);
      setSuccess(true);
      setTitle("");
      setContent("");
      setTarget("all");
      setPriority("info");
      setMediaUrl("");
      refreshData();
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this announcement from logs?")) {
      deleteAdminMessage(id);
      addAdminLog(`Deleted broadcast message ID: ${id}`);
      refreshData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Multimedia Broadcast</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Send rich announcements with media to all NCC participants.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                   {i}
                </div>
              ))}
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{users.length} Active Targets</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Compose Form */}
        <div className="xl:col-span-12 lg:col-span-1 bg-white rounded-[3.5rem] border border-slate-100 p-10 lg:p-14 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-center gap-4 mb-12 relative z-10">
            <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Send size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Announcement</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Reach Mode</p>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
             <div className="space-y-8">
                {/* Target & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <div className="flex gap-2">
                        <select 
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full py-4 px-5 bg-slate-50 border border-slate-100 rounded-[1.25rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        >
                            <option value="all">All Participants (Broadcast)</option>
                            <optgroup label="Specific Users">
                              {users.filter(u => u.role === "user").map(u => (
                                  <option key={u.email} value={u.email}>{u.fullName}</option>
                              ))}
                            </optgroup>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className={`w-full py-4 px-5 border rounded-[1.25rem] text-sm font-bold focus:ring-4 outline-none transition-all ${
                          priority === 'urgent' ? 'bg-rose-50 border-rose-100 text-rose-600 focus:ring-rose-500/10' :
                          priority === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600 focus:ring-amber-500/10' :
                          'bg-indigo-50 border-indigo-100 text-indigo-600 focus:ring-indigo-500/10'
                        }`}
                    >
                        <option value="info">Information (Blue)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="urgent">Urgent / Alert (Red)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                  <input 
                      required
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Pembayaran Gelombang 1 Berakhir Hari Ini"
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea 
                      required
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter the full announcement details here..."
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-300 min-h-[160px]"
                  />
                </div>
             </div>

             <div className="space-y-8 flex flex-col">
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Attachment (Optional)</label>
                  {!mediaUrl ? (
                    <label className="flex-1 flex flex-col items-center justify-center w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all group overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon size={40} className="text-slate-200 group-hover:text-indigo-400 transition-colors mb-4" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select Image Attachment</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="relative flex-1 w-full rounded-[2.5rem] overflow-hidden border-2 border-indigo-100 group shadow-2xl">
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          type="button"
                          onClick={() => setMediaUrl("")}
                          className="w-full py-3 bg-white/20 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all"
                        >
                          Remove Attachment
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={loading}
                    className="w-full py-6 bg-indigo-600 text-white font-black rounded-[1.5rem] text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? "Broadcasting..." : <><Send size={20} /> Launch Announcement</>}
                  </button>

                  {success && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-emerald-600 justify-center text-xs font-black uppercase tracking-widest bg-emerald-50 py-4 rounded-2xl border border-emerald-100"
                    >
                        <CheckCircle2 size={18} /> Announcement Sent!
                    </motion.div>
                  )}
                </div>
             </div>
          </form>
        </div>

        {/* Message Log */}
        <div className="xl:col-span-12 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Dispatches</h3>
                <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {messages.length} Records
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 transition-all"
                        >
                            <button 
                                onClick={() => handleDelete(msg.id)}
                                className="absolute top-6 right-6 z-20 p-2.5 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-slate-100 hover:scale-105 active:scale-90"
                            >
                                <Trash2 size={16} />
                            </button>

                            {msg.mediaUrl ? (
                              <div className="h-32 w-full overflow-hidden bg-slate-50 border-b border-slate-50">
                                <img src={msg.mediaUrl} className="w-full h-full object-cover opacity-50 contrast-125" alt="Thumbnail" />
                              </div>
                            ) : (
                              <div className="h-4 bg-slate-50 w-full" />
                            )}

                            <div className="p-8">
                              <div className="flex items-center gap-2 mb-4">
                                  {msg.target === "all" ? (
                                      <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                                          <Users size={12} /> Broadcast
                                      </span>
                                  ) : (
                                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                          <User size={12} /> Private
                                      </span>
                                  )}
                                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                    msg.type === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    msg.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-50 text-slate-400 border-slate-100'
                                  }`}>
                                    {msg.type || 'info'}
                                  </span>
                              </div>

                              <h4 className="text-md font-black text-slate-900 mb-2 leading-tight">{msg.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-6">{msg.content}</p>
                              
                              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                      <Clock size={12} /> {new Date(msg.sentAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                    ID: #{msg.id.slice(-4)}
                                  </div>
                              </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {messages.length === 0 && (
                    <div className="col-span-full py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                           <MessageSquare className="text-slate-200" size={32} />
                        </div>
                        <h4 className="text-lg font-black text-slate-900 mb-2">No dispatches found</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Start by composing your first message above.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
