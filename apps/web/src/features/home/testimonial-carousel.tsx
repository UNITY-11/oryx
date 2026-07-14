"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  { id: 1, name: "Sarah Al M.", text: "The most relaxing massage I've ever had. The ambiance and professionalism are unmatched in Doha.", initials: "SA" },
  { id: 2, name: "Fatima K.", text: "Absolutely in love with their premium facials. My skin has never glowed this much before!", initials: "FK" },
  { id: 3, name: "Jessica R.", text: "A hidden gem! The attention to detail and the quality of their organic products is incredible.", initials: "JR" },
  { id: 4, name: "Aisha B.", text: "Highly recommend the hot stone therapy. It melts all the stress away perfectly.", initials: "AB" }
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
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
      className="relative w-full h-[250px] md:h-[280px] flex items-center justify-center overflow-hidden py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      {TESTIMONIALS.map((testimonial, index) => {
        const n = TESTIMONIALS.length;
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
          // Right / Next
          translateX = "80%";
          scale = 0.85;
          opacity = 0.5;
          zIndex = 20;
        } else if (offset === -1) {
          // Left / Prev
          translateX = "-80%";
          scale = 0.85;
          opacity = 0.5;
          zIndex = 20;
        } else {
          // Hidden
          translateX = offset > 0 ? "150%" : "-150%";
          scale = 0.7;
          opacity = 0;
          zIndex = 10;
        }

        return (
          <div
            key={testimonial.id}
            className="absolute transition-all duration-700 ease-in-out w-[340px] md:w-[640px] bg-white rounded-[32px] p-6 md:px-8 md:py-5 shadow-sm border border-primary/10 flex flex-col cursor-pointer"
            style={{
              transform: `translateX(${translateX}) scale(${scale})`,
              opacity,
              zIndex,
            }}
            onClick={() => {
              // Click on prev/next to navigate
              if (offset === 1) handleNext();
              if (offset === -1) handlePrev();
            }}
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-text-secondary italic text-sm md:text-base leading-relaxed mb-6 flex-1">
              "{testimonial.text}"
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-medium text-sm">
                {testimonial.initials}
              </div>
              <span className="font-serif font-medium text-text-primary">{testimonial.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
