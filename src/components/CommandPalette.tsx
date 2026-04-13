"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Home, Map, BookOpen, UserPlus, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const jumpTo = (id: string) => {
    setOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-[10vh] items-start">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl shadow-2xl z-10"
          >
            <Command
              className="glass-panel overflow-hidden border border-white/10 rounded-2xl flex flex-col bg-background/80"
            >
              <div className="flex items-center px-4 border-b border-white/10" cmdk-input-wrapper="">
                <Search size={20} className="text-foreground/40 mr-2" />
                <Command.Input
                  autoFocus
                  placeholder="Ketik perintah atau cari (contoh: Pendaftaran)..."
                  className="w-full bg-transparent py-4 outline-none text-foreground text-sm placeholder:text-foreground/30"
                />
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-smooth">
                <Command.Empty className="py-6 text-center text-sm text-foreground/40">
                  Perintah tidak ditemukan.
                </Command.Empty>

                <Command.Group heading="Navigasi" className="text-xs font-semibold text-foreground/40 px-2 py-1 mb-1">
                  <Command.Item
                    onSelect={() => jumpTo("beranda")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-sm text-foreground/80 aria-selected:bg-cyan-accent/20 aria-selected:text-cyan-accent"
                  >
                    <Home size={16} /> Langsung ke Beranda
                  </Command.Item>
                  <Command.Item
                    onSelect={() => jumpTo("kategori")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-sm text-foreground/80 aria-selected:bg-cyan-accent/20 aria-selected:text-cyan-accent"
                  >
                    <BookOpen size={16} /> Lihat Kategori Lomba
                  </Command.Item>
                  <Command.Item
                    onSelect={() => jumpTo("jadwal")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-sm text-foreground/80 aria-selected:bg-cyan-accent/20 aria-selected:text-cyan-accent"
                  >
                    <Map size={16} /> Jadwal Kompetisi
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="h-px bg-white/5 my-2" />

                <Command.Group heading="Aksi" className="text-xs font-semibold text-foreground/40 px-2 py-1 mb-1">
                  <Command.Item
                    onSelect={() => jumpTo("daftar")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-sm text-foreground/80 aria-selected:bg-purple-light/30 aria-selected:text-purple-300"
                  >
                    <UserPlus size={16} /> Mulai Pendaftaran Form
                  </Command.Item>
                  <Command.Item
                    onSelect={() => jumpTo("kontak")}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-sm text-foreground/80 aria-selected:bg-purple-light/30 aria-selected:text-purple-300"
                  >
                    <Mail size={16} /> Hubungi Kami
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
