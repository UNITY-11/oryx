"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  const next = useCallback(
    () =>
      setCurrent((prev) => (slides.length ? (prev + 1) % slides.length : 0)),
    [slides.length]
  );
  const prev = useCallback(
    () =>
      setCurrent((prev) =>
        slides.length ? (prev - 1 + slides.length) % slides.length : 0
      ),
    [slides.length]
  );

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
      className="shadow-spa relative h-64 w-full overflow-hidden rounded-3xl md:aspect-video md:h-auto md:rounded-[3rem] lg:aspect-auto lg:h-[100vh] lg:rounded-none lg:shadow-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={slide.id} className="relative h-full min-w-full">
            {slide.type === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={slide.src}
                className="h-full w-full object-cover"
                muted
                playsInline
                onEnded={() => {
                  if (idx === current) next();
                }}
              />
            ) : (
              <img
                src={slide.src}
                alt={slide.title || "Slide image"}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute top-1/2 left-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-all hover:bg-black/40 lg:left-8 lg:flex lg:h-11 lg:w-11"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute top-1/2 right-3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-all hover:bg-black/40 lg:right-8 lg:flex lg:h-11 lg:w-11"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:bottom-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === current
                    ? "w-6 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
