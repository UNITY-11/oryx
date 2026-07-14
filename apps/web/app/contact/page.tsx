import { Phone, Mail, MapPin, MessageCircle, Navigation } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* Header */}
      <div className="pt-6 px-6 pb-6 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-primary/10">
        <h1 className="font-serif text-3xl text-primary-dark">Contact Us</h1>
        <p className="text-text-secondary mt-2">Get in touch with Oryx Beauty</p>
      </div>

      <div className="p-6 space-y-8">

        {/* Contact Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a
            href="tel:+97412345678"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-[24px] shadow-sm border border-primary/10 hover:shadow-md transition-shadow hover:border-primary/30"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Phone className="w-6 h-6 text-primary-dark" />
            </div>
            <span className="font-medium text-text-primary">Call Us</span>
            <span className="text-xs text-text-secondary mt-1">+974 1234 5678</span>
          </a>

          <a
            href="https://wa.me/97412345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-[24px] shadow-sm border border-primary/10 hover:shadow-md transition-shadow hover:border-primary/30"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-primary-dark" />
            </div>
            <span className="font-medium text-text-primary">WhatsApp</span>
            <span className="text-xs text-text-secondary mt-1">Message Us</span>
          </a>

          <a
            href="mailto:info@oryxbeauty.qa"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-[24px] shadow-sm border border-primary/10 hover:shadow-md transition-shadow hover:border-primary/30"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-primary-dark" />
            </div>
            <span className="font-medium text-text-primary">Email</span>
            <span className="text-xs text-text-secondary mt-1 text-center truncate w-full px-2">info@oryxbeauty.qa</span>
          </a>

          <a
            href="https://maps.google.com/?q=Abu+Hamour,+Doha,+Qatar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 bg-white rounded-[24px] shadow-sm border border-primary/10 hover:shadow-md transition-shadow hover:border-primary/30"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Navigation className="w-6 h-6 text-primary-dark" />
            </div>
            <span className="font-medium text-text-primary">Directions</span>
            <span className="text-xs text-text-secondary mt-1">Open Map</span>
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 py-2">
          <a href="#" className="w-12 h-12 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary-dark hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary-dark hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary-dark hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
          </a>
          <a href="#" className="w-12 h-12 rounded-full bg-white border border-primary/10 flex items-center justify-center text-primary-dark hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
          </a>
        </div>


        {/* Address and Map */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-primary/10 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-primary-dark mb-1">Our Location</h3>
              <p className="text-text-secondary leading-relaxed">
                Abu Hamour, Doha, Qatar
              </p>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="w-full h-64 bg-gray-100 rounded-[24px] overflow-hidden">
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
