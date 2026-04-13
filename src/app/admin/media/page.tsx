"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Download, 
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getSiteMedia, 
  uploadSiteMedia, 
  deleteSiteMedia, 
  SiteMedia 
} from "@/lib/localAuth";

export default function MediaManager() {
  const [media, setMedia] = useState<SiteMedia[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "gallery" as SiteMedia["category"],
    url: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMedia(getSiteMedia());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large. Please use images under 2MB for local storage.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({ ...uploadData, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.url || !uploadData.title) return;

    setIsUploading(true);
    await new Promise(r => setTimeout(r, 1000)); // UX delay

    const res = uploadSiteMedia(uploadData);
    if (res.success) {
      setIsUploadModalOpen(false);
      setUploadData({ title: "", category: "gallery", url: "" });
      refreshData();
    } else {
      alert("Failed to upload media.");
    }
    setIsUploading(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this media asset?")) {
      deleteSiteMedia(id);
      refreshData();
    }
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Media Manager</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage visual assets for your website sections.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-3xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={18} /> Upload New Asset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search assets by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          {["All", "banner", "gallery", "sponsor"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-3 rounded-[1.25rem] text-xs font-bold uppercase tracking-widest transition-all ${
                filterCategory === cat 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                  : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="text-slate-200" size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No media found</h3>
          <p className="text-slate-400 font-medium">Upload your first image to start beautifying the website.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMedia.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
              >
                <div className="aspect-square bg-slate-50 overflow-hidden relative">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-white">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-black text-slate-900 truncate tracking-tight">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 lg:p-12 shadow-2xl overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upload Asset</h3>
                  <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Hero Banner 2026"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                       <select 
                        value={uploadData.category}
                        onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none outline-none"
                      >
                        <option value="banner">Banner / Hero</option>
                        <option value="gallery">Gallery Section</option>
                        <option value="sponsor">Sponsor Logo</option>
                      </select>
                      <Filter size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">File Upload (Max 2MB)</label>
                    {!uploadData.url ? (
                      <label className="flex flex-col items-center justify-center w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all group overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon size={32} className="text-slate-300 group-hover:text-indigo-400 transition-colors mb-4 scale-125" />
                          <p className="text-sm text-slate-400 font-bold group-hover:text-indigo-600 transition-colors uppercase tracking-[2px]">Select Image</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    ) : (
                      <div className="relative h-48 w-full rounded-[2rem] overflow-hidden border-2 border-indigo-100 group shadow-lg">
                        <img src={uploadData.url} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setUploadData({ ...uploadData, url: "" })}
                          className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    disabled={isUploading || !uploadData.url || !uploadData.title}
                    className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] tracking-widest shadow-2xl shadow-indigo-100 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isUploading ? <CheckCircle2 className="animate-pulse" /> : "Confirm Upload"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
