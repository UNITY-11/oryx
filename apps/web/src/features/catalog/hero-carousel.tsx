"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
    title: "Relax & Rejuvenate",
    subtitle: "Experience our signature massages.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
    title: "Glowing Skin",
    subtitle: "Discover our premium facials.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800",
    title: "Luxury Products",
    subtitle: "Take the spa experience home.",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-3xl shadow-spa">
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h2 className="font-serif text-3xl font-medium">{slide.title}</h2>
              <p className="font-sans text-sm mt-1 opacity-90">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full backdrop-blur-sm text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full backdrop-blur-sm text-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {SLIDES.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2 h-2 rounded-full transition-colors ${idx === current ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
