"use client";

import { useHero } from "@/features/hero/api/use-hero";
import { HeroGrid } from "@/features/hero/ui/hero-grid";

export default function HeroPage() {
  const { heroItems, loading, error } = useHero();

  return (
    <HeroGrid
      loading={loading}
      error={error}
      items={heroItems}
    />
  );
}
