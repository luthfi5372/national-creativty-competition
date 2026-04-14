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
import SpeedMonitor from "@/components/SpeedMonitor";

// Load dynamically without SSR so GSAP doesn't break
const ParallaxBackground = dynamic(() => import("@/components/ParallaxBackground"), { ssr: false });

export default function Home() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar selection:bg-indigo-500/30">
      <ParallaxBackground />
      <Navbar />
      <SpeedMonitor />

      <main className="w-full">
        {/* Slide 1: Hero */}
        <section className="h-screen w-full snap-start snap-always shrink-0">
          <HeroSection />
        </section>

        {/* Slide 2: Features */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center">
          <FeatureGrid />
        </section>

        {/* Slide 3: Gallery */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center">
          <GallerySection />
        </section>

        {/* Slide 4: Categories */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center">
          <CategoryCards />
        </section>

        {/* Slide 5: Pricing */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center">
          <PricingSection />
        </section>

        {/* Slide 6: Indonesia Map */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center">
          <IndonesiaMap />
        </section>

        {/* Slide 7: Timeline */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center overflow-hidden">
          <TimelineSection />
        </section>

        {/* Slide 8: FAQ */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex items-center justify-center overflow-hidden">
          <FAQSection />
        </section>

        {/* Slide 9: Footer */}
        <section className="h-screen w-full snap-start snap-always shrink-0 flex flex-col justify-end">
          <Footer />
        </section>
      </main>

      {/* Global CSS for snap container to hide default scrollbar if needed */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
// Final verification commit: Wed Apr 15 01:16:23 WIB 2026
