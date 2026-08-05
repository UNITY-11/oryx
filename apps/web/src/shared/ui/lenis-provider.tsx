"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

import "lenis/dist/lenis.css";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1.2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main
      ref={wrapperRef}
      id="main-scroll-container"
      className="scrollbar-hide flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
    >
      <div ref={contentRef}>{children}</div>
    </main>
  );
}
