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

  if (!media) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-inter text-white">
      {/* Vercel-style Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">national-creativity-competition</span>
          <span className="text-white/20">/</span>
          <span className="text-white px-2 py-0.5 bg-white/10 rounded-md">media-assets-manager</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Media Assets</h1>
            <p className="text-slate-500 text-[13px] font-medium mt-1">Global repository for website visual content and marketing resources.</p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-white text-black font-bold rounded-lg text-[12px] hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Add Asset
          </button>
        </div>
      </div>

      {/* Modern Filter Strip (Vercel Style) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-[#000] border border-white/10 rounded-lg text-[13px] font-medium text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#000] border border-white/10 rounded-lg p-1">
          {["All", "banner", "gallery", "sponsor"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-tight transition-all ${
                filterCategory === cat 
                  ? "bg-white text-black shadow-lg" 
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-[#000] border border-white/10 border-dashed rounded-xl p-24 text-center">
          <ImageIcon className="text-slate-700 mx-auto mb-4" size={32} />
          <p className="text-sm font-bold text-slate-500 italic">No indexed assets in this collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMedia.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group relative bg-[#000] border border-white/10 rounded-xl overflow-hidden shadow-2xl hover:border-white/20 transition-all"
              >
                <div className="aspect-[4/3] bg-white/5 overflow-hidden relative">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[9px] font-bold uppercase tracking-widest text-indigo-400 border border-white/10">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h4 className="text-[13px] font-bold text-white truncate">{item.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-slate-500 font-medium">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal (Vercel Style) */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#000]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#000] border border-white/10 w-full max-w-lg rounded-xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-lg font-bold text-white">Index New Asset</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-2 border border-white/10 hover:bg-white/5 rounded-lg transition-colors text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Descriptor Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Production Master Banner"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[13px] font-medium text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Registry Category</label>
                  <select 
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-[13px] font-medium text-white focus:outline-none focus:border-white/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="banner">Production Banner</option>
                    <option value="gallery">Public Gallery</option>
                    <option value="sponsor">Corporate Partner</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Source Document</label>
                  {!uploadData.url ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-indigo-500/50 transition-all group">
                      <ImageIcon size={24} className="text-slate-600 mb-2 group-hover:text-indigo-400 transition-colors" />
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Ingest Local File</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="relative h-40 w-full rounded-xl overflow-hidden border border-white/10">
                      <img src={uploadData.url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                      <button 
                        type="button"
                        onClick={() => setUploadData({ ...uploadData, url: "" })}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-rose-600 transition-all"
                      >
                        <X size={14}/>
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  disabled={isUploading || !uploadData.url || !uploadData.title}
                  className="w-full py-3 bg-white text-black rounded-lg text-[12px] font-bold hover:bg-slate-200 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {isUploading ? "Processing..." : "Confirm Indexing"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
