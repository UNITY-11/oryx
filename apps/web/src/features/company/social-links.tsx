"use client";

import { Link2 } from "lucide-react";

import type { SocialLink } from "./types";
import { useCompany } from "./use-company";

type SocialLinksProps = {
  variant?: "footer" | "contact";
  className?: string;
};

export function SocialIcon({ platform }: { platform: string }) {
  const normalized = platform.toLowerCase();

  if (normalized === "instagram") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  if (normalized === "facebook") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }

  if (normalized === "x" || normalized === "twitter") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    );
  }

  if (normalized === "youtube") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    );
  }

  if (normalized === "linkedin") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (normalized === "tiktok") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    );
  }

  if (normalized === "snapchat") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 2c3 0 5 2 5 5v2c2 0 3 1 3 3s-1 3-3 3c0 2-2 4-5 4s-5-2-5-4c-2 0-3-1-3-3s1-3 3-3V7c0-3 2-5 5-5z" />
      </svg>
    );
  }

  return <Link2 className="h-5 w-5" />;
}

function linkClassName(variant: "footer" | "contact") {
  if (variant === "contact") {
    return "border-primary/10 text-primary hover:bg-primary/5 hover:border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm transition-all";
  }

  return "border-primary/20 hover:bg-primary hover:border-primary flex h-10 w-10 items-center justify-center rounded-full border bg-white text-[#e8baa0] shadow-sm transition-all hover:text-white";
}

function SocialLinkItem({
  link,
  variant,
}: {
  link: SocialLink;
  variant: "footer" | "contact";
}) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.platform}
      title={link.platform}
      className={linkClassName(variant)}
    >
      <SocialIcon platform={link.platform} />
    </a>
  );
}

export function SocialLinks({
  variant = "footer",
  className = "",
}: SocialLinksProps) {
  const { socialLinks, loading } = useCompany();

  if (loading || socialLinks.length === 0) {
    return null;
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      {socialLinks.map((link) => (
        <SocialLinkItem key={link.id} link={link} variant={variant} />
      ))}
    </div>
  );
}
