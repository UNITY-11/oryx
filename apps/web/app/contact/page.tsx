import { Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen pt-24 pb-32">
      <div className="mx-auto max-w-screen-2xl space-y-8 p-6 md:px-12 lg:px-16">
        {/* Contact Action Buttons */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <a
            href="tel:+97412345678"
            className="border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center rounded-[24px] border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Phone className="text-primary h-6 w-6" />
            </div>
            <span className="text-text-primary font-medium">Call Us</span>
            <span className="text-text-secondary mt-1 text-xs">
              +974 1234 5678
            </span>
          </a>

          <a
            href="https://wa.me/97412345678"
            target="_blank"
            rel="noopener noreferrer"
            className="border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center rounded-[24px] border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <MessageCircle className="text-primary h-6 w-6" />
            </div>
            <span className="text-text-primary font-medium">WhatsApp</span>
            <span className="text-text-secondary mt-1 text-xs">Message Us</span>
          </a>

          <a
            href="mailto:info@oryxbeauty.qa"
            className="border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center rounded-[24px] border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Mail className="text-primary h-6 w-6" />
            </div>
            <span className="text-text-primary font-medium">Email</span>
            <span className="text-text-secondary mt-1 w-full truncate px-2 text-center text-xs">
              info@oryxbeauty.qa
            </span>
          </a>

          <a
            href="https://maps.google.com/?q=Abu+Hamour,+Doha,+Qatar"
            target="_blank"
            rel="noopener noreferrer"
            className="border-primary/10 hover:border-primary/30 flex flex-col items-center justify-center rounded-[24px] border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Navigation className="text-primary h-6 w-6" />
            </div>
            <span className="text-text-primary font-medium">Directions</span>
            <span className="text-text-secondary mt-1 text-xs">Open Map</span>
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 py-2">
          <a
            href="#"
            className="border-primary/10 text-primary hover:bg-primary/5 hover:border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
          <a
            href="#"
            className="border-primary/10 text-primary hover:bg-primary/5 hover:border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href="#"
            className="border-primary/10 text-primary hover:bg-primary/5 hover:border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="#"
            className="border-primary/10 text-primary hover:bg-primary/5 hover:border-primary/30 flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-sm transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        </div>

        {/* Address and Map */}
        <div className="border-primary/10 space-y-6 rounded-[32px] border bg-white p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <MapPin className="text-primary h-5 w-5" />
            </div>
            <div>
              <h3 className="text-primary mb-1 font-serif text-lg">
                Our Location
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Abu Hamour, Doha, Qatar
              </p>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="h-64 w-full overflow-hidden rounded-[24px] bg-gray-100 md:h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14432.222271813134!2d51.4886675!3d25.2687588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45d064d1f5e82b%3A0x6e709a311db65f7c!2sAbu%20Hamour%2C%20Doha%2C%20Qatar!5e0!3m2!1sen!2sus!4v1715000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
