"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Sparkles, Flower2, Droplets, Scissors, User, MapPin, Phone, Brush, Wind, Heart, Bath } from "lucide-react";
import { HeroCarousel } from "@/features/catalog/hero-carousel";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { Item } from "@/shared/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mainArea = document.getElementById("main-scroll-container");
    if (!mainArea) return;

    const handleScroll = () => {
      const scrollY = mainArea.scrollTop;

      const startHeight = 100;
      const endHeight = 54;

      // Reduce height by 1px for every 1px scrolled down, clamped to the endHeight
      const newHeight = Math.max(endHeight, startHeight - scrollY);

      if (logoRef.current) {
        logoRef.current.style.height = `${newHeight}px`;
      }
    };

    mainArea.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => mainArea.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredItems = ALL_MOCK_ITEMS.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Header & Search in a zero-height fixed wrapper to prevent layout shift */}
      <div className="md:hidden fixed top-0 left-0 z-40 h-0 overflow-visible w-full">
        <div className="bg-[#f5e6de]/90 backdrop-blur-xl px-4 pt-3 pb-3 border-b border-[#d4a373]/20 shadow-sm rounded-b-[36px]">
          <div className="flex justify-center items-center mb-4 min-h-4xl">
            <img
              ref={logoRef}
              src="/images/oryx-logo.png"
              alt="ORYX Logo"
              className="w-auto object-contain will-change-[height] brightness-75 contrast-125"
              style={{ height: "100px" }}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                placeholder="Search treatments or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-4 text-sm placeholder:text-primary focus:ring-2 focus:ring-primary outline-none transition-shadow"
              />
            </div>
            <Link href="/profile" className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-primary hover:text-primary-dark transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Static spacer to push content below the large header initially */}
      <div className="pt-[190px] md:pt-0" />


      {/* Hero Carousel */}
      {!searchQuery && (
        <section className="px-3 md:px-0 mt-6 md:mt-0 pb-8 md:pb-24">
          <HeroCarousel />
        </section>
      )}

      <div className="px-3 md:px-8 lg:px-12 xl:px-16 pb-6 md:pb-24 space-y-8 md:space-y-24 flex-1 w-full max-w-screen-2xl mx-auto">
        {/* Categories Section */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl md:text-3xl text-primary-dark">Categories</h2>
            </div>
            <div className="flex flex-row justify-between w-full overflow-x-auto md:overflow-visible pb-4 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 cat-container">
              <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 767px) {
                  .cat-container { gap: 28px !important; }
                }
                @media (min-width: 768px) {
                  .cat-circle { width: clamp(80px, 8vw, 110px) !important; height: clamp(80px, 8vw, 110px) !important; }
                  .cat-icon { width: clamp(40px, 4vw, 55px) !important; height: clamp(40px, 4vw, 55px) !important; }
                  .cat-text { font-size: clamp(12px, 1.2vw, 15px) !important; }
                }
                @media (min-width: 1024px) {
                  .cat-circle { width: clamp(100px, 9vw, 130px) !important; height: clamp(100px, 9vw, 130px) !important; }
                  .cat-icon { width: clamp(50px, 4.5vw, 65px) !important; height: clamp(50px, 4.5vw, 65px) !important; }
                  .cat-text { font-size: clamp(14px, 1.2vw, 17px) !important; }
                }
              `}} />
              {[
                { name: "Massage", icon: <Flower2 className="w-6 h-6 cat-icon" /> },
                { name: "Facial", icon: <Sparkles className="w-6 h-6 cat-icon" /> },
                { name: "Nails", icon: <Scissors className="w-6 h-6 cat-icon" /> },
                { name: "Therapy", icon: <Droplets className="w-6 h-6 cat-icon" /> },
                { name: "Hair Care", icon: <Wind className="w-6 h-6 cat-icon" /> },
                { name: "Makeup", icon: <Brush className="w-6 h-6 cat-icon" /> },
                { name: "Wellness", icon: <Heart className="w-6 h-6 cat-icon" /> },
                { name: "Spa Bath", icon: <Bath className="w-6 h-6 cat-icon" /> },
              ].map((cat, idx) => (
                <div key={idx} className="flex-none flex flex-col items-center group cursor-pointer w-[72px] md:w-auto">
                  <div className="w-14 h-14 bg-gray-50 border border-primary rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm hover:shadow-md shrink-0 cat-circle">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary mt-2 md:mt-4 text-center cat-text">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        {!searchQuery && (
          <section>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 md:grid md:grid-cols-3 md:gap-6 md:space-x-0 md:px-0 md:mx-0">
              {/* Card 1 */}
              <div className="flex-none w-[92%] md:w-full bg-primary/5 rounded-2xl relative overflow-hidden shadow-sm">

                {/* Edge Cutouts (Ticket holes) */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcf4f0] rounded-full shadow-inner z-20" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcf4f0] rounded-full shadow-inner z-20" />

                {/* Inner Dashed container */}
                <div className="m-2 border-2 border-dashed border-primary/30 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10" />

                  <div className="relative z-10 flex-1 pr-3">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5" /> SPECIAL OFFER
                    </span>
                    <h3 className="font-serif text-lg text-primary-dark mb-1 leading-tight">Get 20% Off Your First Visit</h3>
                  </div>

                  {/* Vertical Dashed separator */}
                  <div className="relative z-10 w-px h-16 border-l-2 border-dashed border-primary/30 mx-2" />

                  <div className="relative z-10 pl-2 text-center flex flex-col items-center justify-center">
                    <p className="text-[9px] text-text-secondary uppercase tracking-wider mb-1 font-bold">Use Code</p>
                    <strong className="text-primary-dark bg-[#fcf4f0] border border-primary/20 px-2.5 py-1 rounded-md text-sm shadow-sm inline-block font-mono tracking-wider">ORYX20</strong>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex-none w-[92%] md:w-full bg-[#d4a373]/10 rounded-2xl relative overflow-hidden shadow-sm">

                {/* Edge Cutouts (Ticket holes) */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcf4f0] rounded-full shadow-inner z-20" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcf4f0] rounded-full shadow-inner z-20" />

                {/* Inner Dashed container */}
                <div className="m-2 border-2 border-dashed border-[#d4a373]/30 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4a373]/20 rounded-full blur-2xl -ml-10 -mb-10" />

                  <div className="relative z-10 flex-1 pr-3">
                    <span className="text-[10px] font-bold text-[#d4a373] tracking-widest uppercase mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> FREE GIFT
                    </span>
                    <h3 className="font-serif text-lg text-primary-dark mb-1 leading-tight">Free Polish With Manicure</h3>
                  </div>

                  {/* Vertical Dashed separator */}
                  <div className="relative z-10 w-px h-16 border-l-2 border-dashed border-[#d4a373]/30 mx-2" />

                  <div className="relative z-10 pl-2 text-center flex flex-col items-center justify-center">
                    <p className="text-[9px] text-text-secondary uppercase tracking-wider mb-1 font-bold">Use Code</p>
                    <strong className="text-primary-dark bg-[#fcf4f0] border border-[#d4a373]/20 px-2.5 py-1 rounded-md text-sm shadow-sm inline-block font-mono tracking-wider">GLOWUP</strong>
                  </div>
                </div>
              </div>

              {/* Card 3 (Bridal Spa Day) */}
              <div className="flex-none w-[92%] md:w-full bg-primary/10 rounded-2xl relative overflow-hidden shadow-sm">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcf4f0] rounded-full shadow-inner z-20" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#fcf4f0] rounded-full shadow-inner z-20" />
                <div className="m-2 border-2 border-dashed border-primary/30 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -ml-10 -mt-10" />
                  <div className="relative z-10 flex-1 pr-3">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1 flex items-center gap-1.5">
                      <Flower2 className="w-3.5 h-3.5" /> PACKAGE
                    </span>
                    <h3 className="font-serif text-lg text-primary-dark mb-1 leading-tight">Bridal Spa Day</h3>
                  </div>
                  <div className="relative z-10 w-px h-16 border-l-2 border-dashed border-primary/30 mx-2" />
                  <div className="relative z-10 pl-2 text-center flex flex-col items-center justify-center">
                    <p className="text-[9px] text-text-secondary uppercase tracking-wider mb-1 font-bold">Use Code</p>
                    <strong className="text-primary-dark bg-[#fcf4f0] border border-primary/20 px-2.5 py-1 rounded-md text-sm shadow-sm inline-block font-mono tracking-wider">BRIDE30</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section>
            <h2 className="font-serif text-xl md:text-3xl text-primary-dark mb-4">Search Results</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {filteredItems.map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="flex-none w-44 group block">
                  <div className="relative h-56 w-full rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <h3 className="absolute bottom-4 left-4 right-4 font-serif text-white font-medium text-lg leading-tight drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-center text-text-secondary py-8 w-full">No items found.</p>
              )}
            </div>
          </section>
        )}

        {/* Featured Services */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl md:text-3xl text-primary-dark">Featured Services</h2>
              <Link href="/services" className="text-sm text-primary font-medium">See All</Link>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {filteredItems.filter(item => !item.isProduct).map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="flex-none w-[44%] md:w-80 group block">
                  <div className="relative h-56 md:h-96 w-full rounded-t-full rounded-b-2xl overflow-hidden shadow-sm border-2 border-[#E5C37A]">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    <h3 className="absolute bottom-4 left-4 right-4 text-center font-serif text-white font-medium text-lg leading-tight drop-shadow-md">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl md:text-3xl text-primary-dark">Our Products</h2>
              <Link href="/products" className="text-sm text-primary font-medium">Show All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-6 md:gap-6">
              {filteredItems.filter(item => item.isProduct).slice(0, 6).map(item => (
                <Link
                  href={`/service/${item.id}`}
                  key={item.id}
                  className="flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-square">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 md:p-6 flex flex-col">
                    <h3 className="font-serif text-text-primary font-medium text-sm md:text-xl leading-tight line-clamp-1">{item.name}</h3>
                  </div>
                </Link>
              ))}
            </div>

          </section>
        )}

        {/* Footer */}
        {!searchQuery && (
          <section className="mt-20 flex flex-col items-center justify-center w-full">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-surface border border-primary/20 flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-surface border border-primary/20 flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-surface border border-primary/20 flex items-center justify-center text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </a>
              </div>

              <div className="flex gap-4 text-xs font-medium text-text-primary">
                <Link href="/privacy" className="hover:text-primary-dark">Privacy Policy</Link>
                <span className="text-primary/40">•</span>
                <Link href="/terms" className="hover:text-primary-dark">Terms of Service</Link>
                <span className="text-primary/40">•</span>
                <Link href="/contact" className="hover:text-primary-dark">Contact</Link>
              </div>

              <p className="text-[10px] md:text-xs text-text-secondary mt-4">
                © {new Date().getFullYear()} ORYX Beauty Spa. All rights reserved.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
