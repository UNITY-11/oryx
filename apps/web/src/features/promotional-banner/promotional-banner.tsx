"use client";

import { SocialIcon } from "@/features/company/social-links";

import { usePromotionalBanner } from "./use-promotional-banner";

export function PromotionalBannerSection() {
  const { banner, loading } = usePromotionalBanner();

  if (loading || !banner) {
    return null;
  }

  const hasText = Boolean(banner.title?.trim() || banner.description?.trim());
  const hasSocialLinks = banner.socialLinks.length > 0;

  return (
    <section className="section-padding">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl shadow-lg md:rounded-[2rem]">
        <div className="relative aspect-[21/9] min-h-[180px] w-full sm:min-h-[220px] md:min-h-[260px]">
          <img
            src={banner.image}
            alt={banner.title || "Promotional banner"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

          {(hasText || hasSocialLinks) && (
            <div className="absolute inset-0 flex items-center px-6 py-6 sm:px-10 md:px-14">
              <div className="max-w-xl space-y-3 text-white sm:space-y-4">
                {banner.title?.trim() && (
                  <h2 className="font-serif text-2xl leading-tight font-semibold drop-shadow-md sm:text-3xl md:text-4xl">
                    {banner.title}
                  </h2>
                )}
                {banner.description?.trim() && (
                  <p className="text-sm leading-relaxed text-white/90 drop-shadow sm:text-base md:text-lg">
                    {banner.description}
                  </p>
                )}
                {hasSocialLinks && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {banner.socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        title={link.platform}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white hover:text-[#e8baa0]"
                      >
                        <SocialIcon platform={link.platform} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
