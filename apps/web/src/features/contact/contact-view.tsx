import { SocialLinks } from "@/features/company/social-links";
import type { CompanyDetails } from "@/features/company/types";
import {
  formatAddress,
  toMailtoLink,
  toTelLink,
  toWhatsAppLink,
} from "@/features/company/utils";
import { LotusSeparator } from "@/shared/ui/lotus-separator";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";

type ContactAction = {
  key: string;
  href: string;
  label: string;
  sublabel: string;
  description: string;
  icon: typeof Phone;
  external?: boolean;
};

function buildActions(company: CompanyDetails): ContactAction[] {
  const actions: ContactAction[] = [];

  if (company.phone?.trim()) {
    const href = toTelLink(company.phone);
    if (href) {
      actions.push({
        key: "phone",
        href,
        label: "Call Us",
        sublabel: company.phone,
        description: "Speak with our team",
        icon: Phone,
      });
    }
  }

  if (company.whatsapp?.trim()) {
    const href = toWhatsAppLink(company.whatsapp);
    if (href) {
      actions.push({
        key: "whatsapp",
        href,
        label: "WhatsApp",
        sublabel: company.whatsapp,
        description: "Message us anytime",
        icon: MessageCircle,
        external: true,
      });
    }
  }

  if (company.email?.trim()) {
    const href = toMailtoLink(company.email);
    if (href) {
      actions.push({
        key: "email",
        href,
        label: "Email",
        sublabel: company.email,
        description: "We reply within 24 hours",
        icon: Mail,
      });
    }
  }

  if (company.mapUrl?.trim()) {
    actions.push({
      key: "directions",
      href: company.mapUrl,
      label: "Get Directions",
      sublabel: "Open in Google Maps",
      description: "Find us easily",
      icon: Navigation,
      external: true,
    });
  }

  return actions;
}

function ContactCard({ action }: { action: ContactAction }) {
  const Icon = action.icon;

  return (
    <a
      href={action.href}
      target={action.external ? "_blank" : undefined}
      rel={action.external ? "noopener noreferrer" : undefined}
      className="group border-primary/15 hover:border-primary/35 flex h-full min-h-[76px] items-center gap-4 rounded-[20px] border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:rounded-[24px] md:p-5 lg:min-h-[104px] lg:gap-5 lg:rounded-[24px] lg:p-5 xl:min-h-[112px] xl:rounded-[28px] xl:p-6"
    >
      <div className="from-primary/15 to-primary/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br lg:h-[52px] lg:w-[52px] xl:h-14 xl:w-14 xl:rounded-3xl">
        <Icon className="text-primary h-5 w-5 xl:h-6 xl:w-6" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary-dark font-medium lg:text-[17px] xl:text-lg">
          {action.label}
        </p>
        <p className="text-text-secondary mt-0.5 truncate text-sm xl:text-base">
          {action.sublabel}
        </p>
        <p className="text-primary/60 mt-1 hidden text-xs md:block lg:text-[13px] xl:text-sm">
          {action.description}
        </p>
      </div>
      <ArrowUpRight className="text-primary/30 group-hover:text-primary h-4 w-4 shrink-0 transition-colors lg:h-5 lg:w-5" />
    </a>
  );
}

function ReachUsSection({
  actions,
  columns = false,
}: {
  actions: ContactAction[];
  columns?: boolean;
}) {
  if (actions.length === 0) return null;

  return (
    <section>
      <h2 className="text-surface mb-4 font-serif text-xl md:text-2xl lg:mb-5 lg:text-center lg:text-2xl xl:mb-6 xl:text-3xl">
        Reach Us
      </h2>
      <div
        className={`grid gap-3 sm:gap-3.5 lg:gap-5 ${
          columns ? "lg:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-1 lg:gap-4"
        }`}
      >
        {actions.map((action) => (
          <ContactCard key={action.key} action={action} />
        ))}
      </div>
    </section>
  );
}

function SocialSection() {
  return (
    <section className="border-primary/15 rounded-[28px] border bg-white/90 p-6 shadow-sm backdrop-blur-sm lg:rounded-[28px] lg:p-7 xl:rounded-[32px] xl:p-8">
      <h2 className="text-primary-dark mb-4 font-serif text-lg lg:mb-5 lg:text-xl">
        Follow Us
      </h2>
      <SocialLinks variant="contact" className="justify-start gap-4" />
    </section>
  );
}

export function ContactView({
  company,
  error,
}: {
  company: CompanyDetails | null;
  error: string | null;
}) {
  const actions = company ? buildActions(company) : [];
  const address = company ? formatAddress(company) : "";
  const showLocation = Boolean(address || company?.mapEmbedUrl?.trim());
  const hasSocial = Boolean(
    company?.socialLinks && company.socialLinks.length > 0
  );
  const hasContent = actions.length > 0 || showLocation;

  return (
    <div className="min-h-screen pt-20 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pt-28 md:pb-32 lg:pt-32 lg:pb-20 xl:pb-24">
      <div className="mx-auto max-w-6xl px-5 md:px-10 lg:max-w-7xl lg:px-16 xl:max-w-[88rem] xl:px-20">
        <header className="mb-10 text-center md:mb-14 lg:mb-12 xl:mb-16">
          <p className="text-primary/80 mb-2 text-xs font-semibold tracking-[0.2em] uppercase lg:text-sm">
            Get in Touch
          </p>
          <h1 className="text-surface font-serif text-3xl font-semibold md:text-5xl lg:text-5xl xl:text-6xl">
            Contact Us
          </h1>
          <LotusSeparator className="mx-auto -mt-2 max-w-[180px] md:max-w-[220px] lg:max-w-[260px] xl:max-w-[300px]" />
          {company?.name && (
            <p className="text-surface/90 mt-4 font-serif text-lg md:text-xl lg:text-xl xl:text-2xl">
              {company.name}
            </p>
          )}
          {company?.tagline?.trim() && (
            <p className="text-surface/75 mx-auto mt-2 max-w-lg text-sm leading-relaxed md:text-base lg:mt-3 lg:max-w-xl lg:text-[15px] xl:mt-4 xl:max-w-2xl xl:text-lg">
              {company.tagline}
            </p>
          )}
        </header>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4 text-center text-sm text-red-700 backdrop-blur-sm">
            {error}
          </div>
        )}

        {!error && !hasContent && (
          <div className="border-primary/15 rounded-[28px] border bg-white/80 px-6 py-14 text-center shadow-sm backdrop-blur-sm">
            <div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <Mail className="text-primary h-6 w-6" />
            </div>
            <p className="text-primary-dark font-medium">
              Contact details coming soon
            </p>
            <p className="text-text-secondary mt-2 text-sm">
              Please check back shortly.
            </p>
          </div>
        )}

        {hasContent && showLocation && (
          <div className="flex flex-col gap-8 lg:gap-10 xl:gap-14">
            <div className="space-y-8 lg:space-y-10">
              <ReachUsSection actions={actions} columns />
              {hasSocial && (
                <div className="mx-auto w-full lg:max-w-2xl">
                  <SocialSection />
                </div>
              )}
            </div>

            <section>
              <div className="border-primary/15 overflow-hidden rounded-[28px] border bg-white shadow-sm lg:rounded-[32px] lg:shadow-md">
                {address && (
                  <div className="border-primary/10 border-b p-6 md:p-8 lg:p-8 xl:p-10">
                    <div className="flex items-start gap-4 lg:flex-col lg:items-center lg:gap-5 lg:text-center xl:gap-6">
                      <div className="from-primary/15 to-primary/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br xl:h-14 xl:w-14 xl:rounded-3xl">
                        <MapPin
                          className="text-primary h-5 w-5 xl:h-6 xl:w-6"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-primary-dark font-serif text-xl md:text-2xl xl:text-3xl">
                          Visit Us
                        </h2>
                        <p className="text-text-secondary mt-2 leading-relaxed lg:mx-auto lg:max-w-2xl lg:text-[15px] xl:mt-2 xl:max-w-3xl xl:text-lg">
                          {address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {company?.mapEmbedUrl?.trim() ? (
                  <div className="relative h-64 w-full bg-gray-100 md:h-[380px] lg:h-[420px] xl:h-[480px]">
                    <iframe
                      title="Company location map"
                      src={company.mapEmbedUrl}
                      className="absolute inset-0 h-full w-full"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                ) : (
                  <div className="from-primary/5 flex h-48 items-center justify-center bg-gradient-to-br to-white md:h-56 lg:h-64">
                    <p className="text-text-secondary text-sm">
                      Map preview not available
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {hasContent && !showLocation && (
          <div className="mx-auto max-w-5xl space-y-8 lg:max-w-6xl lg:space-y-10 xl:max-w-7xl">
            <section>
              <h2 className="text-surface mb-4 text-center font-serif text-xl md:text-2xl lg:mb-6 lg:text-3xl">
                Reach Us
              </h2>
              <div className="grid gap-3 sm:gap-3.5 lg:grid-cols-2 lg:gap-5 xl:grid-cols-3 xl:gap-6">
                {actions.map((action) => (
                  <ContactCard key={action.key} action={action} />
                ))}
              </div>
            </section>

            {hasSocial && (
              <div className="mx-auto max-w-xl lg:max-w-md">
                <SocialSection />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
