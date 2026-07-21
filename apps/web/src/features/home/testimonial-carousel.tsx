"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { useReviews } from "./use-reviews";

export function TestimonialCarousel() {
  const { reviews, loading } = useReviews();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsLargeScreen(window.innerWidth >= 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (isHovered || reviews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, reviews.length]);

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Touch handlers for swiping
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? null);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? null);
  };
  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  return (
    <div
      className="relative flex h-[250px] w-full items-center justify-center overflow-hidden py-4 md:h-[280px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-text-secondary">
          No reviews available.
        </div>
      ) : (
        reviews.map((testimonial, index) => {
          const n = reviews.length;
          let offset = index - currentIndex;

          // Normalize offset to be between -Math.floor(n/2) and Math.floor(n/2)
          if (offset > Math.floor(n / 2)) offset -= n;
          if (offset < -Math.floor(n / 2)) offset += n;

          // Styling based on offset position
          let translateX = "0%";
          let scale = 1;
          let opacity = 1;
          let zIndex = 30;

          if (offset === 0) {
            // Center / Active
            translateX = "0%";
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (offset === 1) {
            // Right 1
            translateX = isLargeScreen ? "55%" : "80%";
            scale = 0.85;
            opacity = isLargeScreen ? 0.8 : 0.5;
            zIndex = 20;
          } else if (offset === -1) {
            // Left 1
            translateX = isLargeScreen ? "-55%" : "-80%";
            scale = 0.85;
            opacity = isLargeScreen ? 0.8 : 0.5;
            zIndex = 20;
          } else if (offset === 2) {
            // Right 2
            translateX = isLargeScreen ? "110%" : "150%";
            scale = 0.7;
            opacity = isLargeScreen ? 0.4 : 0;
            zIndex = 10;
          } else if (offset === -2) {
            // Left 2
            translateX = isLargeScreen ? "-110%" : "-150%";
            scale = 0.7;
            opacity = isLargeScreen ? 0.4 : 0;
            zIndex = 10;
          } else {
            // Hidden
            translateX = offset > 0 ? "150%" : "-150%";
            scale = 0.5;
            opacity = 0;
            zIndex = 0;
          }

          return (
            <div
              key={testimonial.id}
              className="border-primary/10 absolute flex w-full max-w-[340px] cursor-pointer flex-col rounded-[32px] border bg-white p-6 shadow-sm transition-all duration-700 ease-in-out md:max-w-[380px] md:px-8 md:py-5"
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity,
                zIndex,
              }}
              onClick={() => {
                // Click on prev/next to navigate
                if (offset === 1 || offset === 2) handleNext();
                if (offset === -1 || offset === -2) handlePrev();
              }}
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-[#e5c37a] text-[#e5c37a] h-4 w-4 md:h-5 md:w-5"
                  />
                ))}
              </div>
              <p className="text-text-secondary mb-6 flex-1 text-sm leading-relaxed italic md:text-base">
                "{testimonial.text}"
              </p>
              <div className="mt-auto flex items-center gap-3">
                <div className="bg-primary/10 text-primary-dark flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium">
                  {testimonial.initials}
                </div>
                <span className="text-text-primary font-serif font-medium">
                  {testimonial.name}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
