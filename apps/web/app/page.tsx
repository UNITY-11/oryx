"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Sparkles, Flower2, Droplets, Scissors, User, MapPin, Phone } from "lucide-react";
import { HeroCarousel } from "@/features/catalog/hero-carousel";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { Item } from "@/shared/types";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFooterOpen, setIsFooterOpen] = useState(false);
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
    <div className="flex flex-col min-h-screen">
      {/* Header & Search in a zero-height sticky wrapper to prevent layout shift */}
      <div className="sticky top-0 z-40 h-0 overflow-visible w-full">
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search treatments or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow"
              />
            </div>
            <Link href="/profile" className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-text-secondary hover:text-primary transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Static spacer to push content below the large header initially */}
      <div className="pt-[190px]" />


      <div className="px-6 pb-6 space-y-8 flex-1">
        {/* Hero Carousel */}
        {!searchQuery && (
          <section className="mt-8">
            <HeroCarousel />
          </section>
        )}

        {/* Categories Section */}
        {!searchQuery && (
          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-serif text-xl text-primary-dark">Categories</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: "Massage", icon: <Flower2 className="w-6 h-6" /> },
                { name: "Facial", icon: <Sparkles className="w-6 h-6" /> },
                { name: "Nails", icon: <Scissors className="w-6 h-6" /> },
                { name: "Therapy", icon: <Droplets className="w-6 h-6" /> },
              ].map((cat, idx) => (
                <div key={idx} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-medium text-text-secondary mt-2">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Promotional Banner */}
        {!searchQuery && (
          <section>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {/* Card 1 */}
              <div className="flex-none w-[92%] bg-primary/5 rounded-2xl relative overflow-hidden shadow-sm">

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
              <div className="flex-none w-[92%] bg-[#d4a373]/10 rounded-2xl relative overflow-hidden shadow-sm">

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
            </div>
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section>
            <h2 className="font-serif text-xl text-primary-dark mb-4">Search Results</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
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
              <h2 className="font-serif text-xl text-primary-dark">Featured Services</h2>
              <Link href="/services" className="text-sm text-primary font-medium">See All</Link>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {filteredItems.filter(item => !item.isProduct).map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="flex-none w-[44%] group block">
                  <div className="relative h-56 w-full rounded-t-full rounded-b-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02]">
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
              <h2 className="font-serif text-xl text-primary-dark">Shop Products</h2>
              <Link href="/products" className="text-sm text-primary font-medium">Show All</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.filter(item => item.isProduct).slice(0, 6).map(item => (
                <Link href={`/service/${item.id}`} key={item.id} className="group block">
                  <div className="relative aspect-square rounded-2xl overflow-hidden transition-transform group-hover:scale-[1.02] mb-2 bg-surface">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col px-1">
                    <h3 className="font-medium text-sm text-text-primary leading-tight line-clamp-1">{item.name}</h3>
                    <span className="font-semibold text-primary mt-1 text-[13px]">${item.price}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/products" className="mt-4 w-full block text-center py-3 rounded-2xl border border-gray-200 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
              View All Products
            </Link>
          </section>
        )}

        {/* Footer / Location Section */}
        {!searchQuery && (
          <section className="mt-4 pt-8 border-t border-[#d4a373]/20 pb-4 flex flex-col items-center">
            <button
              onClick={() => setIsFooterOpen(!isFooterOpen)}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors mb-2 bg-[#fcf4f0] px-5 py-2.5 rounded-full shadow-sm border border-[#d4a373]/20"
            >
              {isFooterOpen ? "Hide Contact & Location" : "Show Contact & Location"}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isFooterOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {isFooterOpen && (
              <div className="w-full animate-in fade-in slide-in-from-top-4 duration-300 mt-6">
                {/* Location & Map */}
                <div className="mb-8">
                  <h2 className="font-serif text-xl text-primary-dark mb-4">Visit Us</h2>
                  <div className="bg-[#fcf4f0] rounded-2xl p-4 shadow-sm border border-[#d4a373]/20">
                    <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden mb-4 relative shadow-inner">
                      {/* Google Maps iFrame Placeholder */}
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14440.751680193132!2d55.275143!3d25.197197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43348a67e24b%3A0xff45e502e1ceb7e2!2sBurj%20Khalifa!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div className="flex items-start gap-3 text-text-secondary text-sm">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary-dark">ORYX Beauty Spa</p>
                        <p>Dubai Marina, Marina Mall</p>
                        <p>Dubai, UAE</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-text-secondary text-sm mt-3">
                      <Phone className="w-5 h-5 text-primary shrink-0" />
                      <p>+971 50 123 4567</p>
                    </div>
                  </div>
                </div>

                {/* Social & Links */}
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                    </a>
                  </div>

                  <div className="flex gap-4 text-xs font-medium text-text-secondary/70">
                    <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
                    <span>•</span>
                    <Link href="/contact" className="hover:text-primary">Contact</Link>
                  </div>

                  <p className="text-[10px] text-text-secondary/50">
                    © {new Date().getFullYear()} ORYX Beauty Spa. All rights reserved.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
