"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    type: "video",
    src: "/videos/animate-video.mp4",
    title: "Welcome to ORYX",
    subtitle: "The ultimate relaxation experience.",
  },
  {
    id: 2,
    type: "image",
    src: "/images/hero/image.png",
    title: "Relax & Rejuvenate",
    subtitle: "Experience our signature massages.",
  },
  {
    id: 3,
    type: "image",
    src: "/images/hero/image%20copy.png",
    title: "Glowing Skin",
    subtitle: "Discover our premium facials.",
  },
  {
    id: 4,
    type: "image",
    src: "/images/hero/image%20copy%202.png",
    title: "Luxury Products",
    subtitle: "Take the spa experience home.",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length), []);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end to avoid stale values
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      next();
    }
    if (isRightSwipe) {
      prev();
    }
  };

  useEffect(() => {
    // Handle video play/pause based on current slide
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === current) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });

    if (SLIDES[current]?.type === "video") {
      // Don't auto-advance via timer; rely on video's onEnded event
      return;
    }

    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [current, next]);

  return (
    <div 
      className="relative w-full h-64 md:h-[100vh] overflow-hidden rounded-3xl md:rounded-none shadow-spa md:shadow-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, idx) => (
          <div key={slide.id} className="min-w-full h-full relative">
            {slide.type === "video" ? (
              <video 
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={slide.src} 
                className="w-full h-full object-cover" 
                muted 
                playsInline 
                onEnded={() => {
                  if (idx === current) next();
                }}
              />
            ) : (
              <img src={slide.src} alt={slide.title} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h2 className="font-serif text-3xl font-medium drop-shadow-md">{slide.title}</h2>
              <p className="font-sans text-sm mt-1 opacity-90 drop-shadow-md">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      
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
