"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import GallerySection from "@/components/GallerySection";
import CategoryCards from "@/components/CategoryCards";
import PricingSection from "@/components/PricingSection";
import IndonesiaMap from "@/components/IndonesiaMap";
import TimelineSection from "@/components/TimelineSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

// Load dynamically without SSR so GSAP doesn't break
const ParallaxBackground = dynamic(() => import("@/components/ParallaxBackground"), { ssr: false });

export default function Home() {
  return (
    <>
      <ParallaxBackground />
      <Navbar />

      <main className="flex flex-col gap-12 sm:gap-24 overflow-hidden pt-12">
        <HeroSection />
        <FeatureGrid />
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
