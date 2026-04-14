"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";

// STATUALLY LOADED (Visible on load)
// Navbar, HeroSection, FeatureGrid

// DYNAMICALLY LOADED (Below the fold)
const GallerySection = dynamic(() => import("@/components/GallerySection"), { 
  loading: () => <div className="h-96 animate-pulse bg-slate-50 rounded-3xl m-8" />
});
const CategoryCards = dynamic(() => import("@/components/CategoryCards"), { ssr: false });
const PricingSection = dynamic(() => import("@/components/PricingSection"), { ssr: false });
const IndonesiaMap = dynamic(() => import("@/components/IndonesiaMap"), { ssr: false });
const TimelineSection = dynamic(() => import("@/components/TimelineSection"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/FAQSection"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

// ParallaxBackground removed for maximum performance

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex flex-col gap-12 sm:gap-24 overflow-hidden pt-12">
        <HeroSection />
        <FeatureGrid />
        
        {/* These load only when reaching the scroll position */}
        <GallerySection />
        <CategoryCards />
        <PricingSection />
        <IndonesiaMap />
        <TimelineSection />
        <FAQSection />
      </main>

      <Footer />
    </>
  );
}
