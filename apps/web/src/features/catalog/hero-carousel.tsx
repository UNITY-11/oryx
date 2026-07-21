"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { HeroItem } from "./sanity";

interface HeroCarouselProps {
  slides: HeroItem[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  const next = useCallback(() => setCurrent((prev) => slides.length ? (prev + 1) % slides.length : 0), [slides.length]);
  const prev = useCallback(() => setCurrent((prev) => slides.length ? (prev - 1 + slides.length) % slides.length : 0), [slides.length]);

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
    if (!slides.length) return;
    
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

    if (slides[current]?.type === "video") {
      // Don't auto-advance via timer; rely on video's onEnded event
      return;
    }

    const timer = setInterval(() => {
      next();
    }, 5000);
    return () => clearInterval(timer);
  }, [current, next, slides]);

  if (!slides || slides.length === 0) return null;

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
        {slides.map((slide, idx) => (
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
              <img src={slide.src} alt={slide.title || "Slide image"} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
      
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full transition-colors ${idx === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
