"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Al M.",
    text: "The most relaxing massage I've ever had. The ambiance and professionalism are unmatched in Doha.",
    initials: "SA",
  },
  {
    id: 2,
    name: "Fatima K.",
    text: "Absolutely in love with their premium facials. My skin has never glowed this much before!",
    initials: "FK",
  },
  {
    id: 3,
    name: "Jessica R.",
    text: "A hidden gem! The attention to detail and the quality of their organic products is incredible.",
    initials: "JR",
  },
  {
    id: 4,
    name: "Aisha B.",
    text: "Highly recommend the hot stone therapy. It melts all the stress away perfectly.",
    initials: "AB",
  },
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
    setCurrentIndex(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
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
            className="border-primary/10 absolute flex w-full max-w-[340px] cursor-pointer flex-col rounded-[32px] border bg-white p-6 shadow-sm transition-all duration-700 ease-in-out md:max-w-[500px] md:px-8 md:py-5"
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
            <div className="mb-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="fill-background text-background h-4 w-4 md:h-5 md:w-5"
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
      })}
    </div>
  );
}
