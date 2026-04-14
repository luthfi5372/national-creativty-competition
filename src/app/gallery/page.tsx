"use client";

import Navbar from "@/components/Navbar";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";

export default function GalleryPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-20">
        {/* Reuse the existing optimized GallerySection */}
        <GallerySection />
      </main>

      <Footer />
    </div>
  );
}
