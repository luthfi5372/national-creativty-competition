"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";

// STATUALLY LOADED (Visible on load)
// Navbar, HeroSection, FeatureGrid

// DYNAMICALLY LOADED (Below the fold)
const CategoryCards = dynamic(() => import("@/components/CategoryCards"), { ssr: false });
const PricingSection = dynamic(() => import("@/components/PricingSection"), { ssr: false });
const IndonesiaMap = dynamic(() => import("@/components/IndonesiaMap"), { ssr: false });
const TimelineSection = dynamic(() => import("@/components/TimelineSection"), { ssr: false });
const FAQSection = dynamic(() => import("@/components/FAQSection"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });

// Documentation/Gallery removed as requested. 
// Schedule (Timeline) and Map restored to landing page for better visibility.

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex flex-col gap-12 sm:gap-24 overflow-hidden pt-12">
        <HeroSection />
        <FeatureGrid />
        
        <CategoryCards />
        <PricingSection />
        
        {/* Restored Sections */}
        <IndonesiaMap />
        <TimelineSection />
        
        <FAQSection />
      </main>

      <Footer />
    </>
  );
}
