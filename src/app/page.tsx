"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";

// STATUALLY LOADED (Visible on load)
// Navbar, HeroSection, FeatureGrid

// VISUAL FOUNDATION (Backgrounds)
const FluidBackground = dynamic(() => import("@/components/FluidBackground"), { ssr: false });
const ParallaxBackground = dynamic(() => import("@/components/ParallaxBackground"), { ssr: false });

// DYNAMICALLY LOADED (Below the fold)
const CategoryCards = dynamic(() => import("@/components/CategoryCards"), { ssr: false });
const PricingSection = dynamic(() => import("@/components/PricingSection"), { ssr: false }); // This matches "Partisipasi Peserta"
const IndonesiaMap = dynamic(() => import("@/components/IndonesiaMap"), { ssr: false });
const TimelineSection = dynamic(() => import("@/components/TimelineSection"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/FAQSection"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Premium Visual Layers */}
      <FluidBackground />
      <ParallaxBackground />
      
      <Navbar />

      <main className="relative z-10 flex flex-col gap-0 overflow-hidden">
        {/* Each section now flows without excessive gaps for a 'one slide' feel */}
        <HeroSection />
        
        <div className="bg-transparent">
          <FeatureGrid />
        </div>
        
        <CategoryCards />
        
        {/* Stats Section (misnamed as PricingSection base on file content) */}
        <PricingSection />
        
        <IndonesiaMap />
        
        <TimelineSection />
        
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
